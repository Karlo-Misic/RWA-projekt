import cors from "cors";
import express from "express";
import { __dirname, dajPortSevis } from "../zajednicko/esmPomocnik.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { RestKorisnik } from "./restKorisnik.js";
import { RestTMDB } from "./restTMDB.js";
import { RestServis } from "./restServis.js";
import { KorisnikDAO } from "./korisnikDAO.js";
import { ServisDAO } from "./servisDAO.js";
//
import sesija from "express-session";
import kolacici from "cookie-parser";
import { HtmlUpravitelj } from "../aplikacija/htmlUpravitelj.js";
//
import * as fs from "fs";
import path from "path";

const korisnikDAO = new KorisnikDAO();

const server = express();
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use(
	cors({
		origin: function (origin, povratniPoziv) {
			if (
				!origin ||
				origin.startsWith("http://spider.foi.hr:") ||
				origin.startsWith("http://localhost:") ||
				origin === "http://localhost:4200"
			) {
				povratniPoziv(null, true);
			} else {
				console.error(`Blokiran CORS zahtjev sa: ${origin}`);
				povratniPoziv(new Error("Nije dozvoljeno zbog CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
		optionsSuccessStatus: 200,
		exposedHeaders: ["Content-Type", "Authorization"],
	})
);

server.options("/*", (req, res) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Requested-With, Accept, Origin"
	);
	res.header("Access-Control-Allow-Credentials", "true");
	res.sendStatus(200);
});

let port = dajPortSevis("kmisic22");
if (process.argv[3] != undefined) {
	port = process.argv[3];
}
//console.log(port);
let konf = new Konfiguracija();
konf
	.ucitajKonfiguraciju()
	.then(pokreniKonfiguraciju)
	.catch((greska: Error | any) => {
		if (process.argv.length == 2)
			console.log("Potrebno je dati naziv datoteke");
		else if (greska.path != undefined)
			console.log("Nije moguće otvoriti datoteku" + greska.path);
		else console.log(greska.message);
		process.exit();
	});

function pokreniKonfiguraciju() {
	server.use(kolacici());
	server.use(
		sesija({
			secret: konf.dajKonf().tajniKljucSesija,
			saveUninitialized: false,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
		})
	);
	pripremiPutanjeResursKorisnika();
	pripremiPutanjeResursTMDB();
	pripremiPutanjeAutentifikacija();
	UploadSLike();

	server.use((req, res, next) => {
		if (req.path.startsWith("/servis")) {
			res.status(404).json({ greska: "API ruta nije pronađena." });
		} else {
			next();
		}
	});

	server.use(
		"/",
		express.static(__dirname() + "../../../angular", {
			index: "index.html",
		})
	);

	server.get("/*", (req, res) => {
		res.sendFile(path.join(__dirname(), "../../angular/index.html"));
	});

	server.use((zahtjev, odgovor) => {
		odgovor.status(404);
		var poruka = { greska: "nepostojeći resurs" };
		odgovor.send(JSON.stringify(poruka));
	});

	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});
}

function pripremiPutanjeResursTMDB() {
	let restTMDB = new RestTMDB(
		konf.dajKonf()["tmdbApiKeyV3"],
		konf.dajKonf()["jwtTajniKljuc"]
	);
	server.get("/servis/tmdb/zanr", restTMDB.getZanr.bind(restTMDB));
	server.get("/servis/tmdb/filmovi", restTMDB.getFilmovi.bind(restTMDB));
	server.get(
		"/servis/tmdb/nasumceFilm",
		restTMDB.dohvatiNasumceFilm.bind(restTMDB)
	);
	server.post("/servis/tmdb/filmoviJWT", restTMDB.getFilmoviJWT.bind(restTMDB));
	server.post("/servis/tmdb/dodajFilm", restTMDB.dodajFilm.bind(restTMDB));
}

function pripremiPutanjeResursKorisnika() {
	let restKorisnik = new RestKorisnik();

	server.get("/servis/korisnici", restKorisnik.getKorisnici.bind(restKorisnik));
	server.get(
		"/servis/dohvatiKorisnike",
		restKorisnik.getKorisnike.bind(restKorisnik)
	);
	server.post(
		"/servis/korisnici",
		restKorisnik.postKorisnici.bind(restKorisnik)
	);
	server.put("/servis/korisnici", restKorisnik.putKorisnici.bind(restKorisnik));
	server.delete(
		"/servis/korisnici",
		restKorisnik.deleteKorisnici.bind(restKorisnik)
	);

	server.get("/servis/korisnici/:korime", async (req, res) => {
		const korime = req.params.korime;
		try {
			const korisnik = await korisnikDAO.daj(korime);
			if (korisnik) {
				res.status(200).json({
					ime: korisnik.ime,
					prezime: korisnik.prezime,
					korime: korisnik.korime,
					lozinka: korisnik.lozinka,
					email: korisnik.email,
					adresa: korisnik.adresa,
					brojMobitela: korisnik.brojMobitela,
					spol: korisnik.spol,
					zahtjevZaPristup:
						korisnik.zahtjevZaPristup === "zahtjevNijePoslan"
							? "Nema pristup"
							: korisnik.zahtjevZaPristup === "approved"
							? "Ima pristup"
							: "pending",
				});
			} else {
				res.status(404).json({ greska: "Korisnik nije pronađen." });
			}
		} catch (err) {
			res.status(500).json({ greska: "Greška na serveru." });
		}
	});

	server.put("/servis/korisnici/:korime/status", async (req, res) => {
		const korime = req.params.korime;

		try {
			const korisnik = await korisnikDAO.daj(korime);

			if (!korisnik) {
				res.status(404).json({ greska: "Korisnik nije pronađen." });
				return;
			}

			console.log("Trenutni status korisnika:", korisnik.zahtjevZaPristup);

			const noviStatus = req.body.status;

			if (
				!["approved", "pending", "zahtjevNijePoslan", ""].includes(noviStatus)
			) {
				res.status(400).json({ greska: "Nevažeći status." });
				return;
			}

			let brojStatusa;
			if (noviStatus === "approved") {
				brojStatusa = 2;
			} else if (noviStatus === "pending") {
				brojStatusa = 1;
			} else {
				brojStatusa = 0;
			}

			console.log("Novi status koji se postavlja:", noviStatus);

			await korisnikDAO.azuriraj(korime, {
				...korisnik,
				pristup: brojStatusa,
				zahtjevZaPristup: noviStatus,
			});

			res.status(200).json({
				poruka: `Status korisnika ${korime} ažuriran: pristup = ${brojStatusa}, zahtjevZaPristup = ${noviStatus}.`,
			});
		} catch (err) {
			//console.error("Greška na serveru:", err.message);
			res.status(500).json({ greska: "Greška na serveru." });
		}
	});

	server.post("/servis/korisnici/:korime/zahtjev", async (req, res) => {
		const korime = req.params.korime;

		try {
			const korisnik = await korisnikDAO.daj(korime);
			if (korisnik) {
				await korisnikDAO.azuriraj(korime, {
					...korisnik,
					pristup: 1,
					zahtjevZaPristup: "pending",
				});

				res.status(200).json({ poruka: "Zahtjev je uspješno poslan adminu." });
			} else {
				res.status(404).json({ greska: "Korisnik nije pronađen." });
			}
		} catch (err) {
			console.error("Greška na serveru:", (err as Error).message);
			res.status(500).json({ greska: "Greška na serveru." });
		}
	});

	server.get("/servis/korisnici/:korime/status", async (req, res) => {
		const korime = req.params.korime;

		const statusMap: { [key: number]: string } = {
			1: "pending",
			2: "approved",
		};

		try {
			const korisnik = await korisnikDAO.daj(korime);
			if (korisnik) {
				const statusTekst = statusMap[korisnik.pristup] || "unknown";

				res.status(200).json({
					korisnik: korime,
					status: statusTekst,
				});
			} else {
				res.status(404).json({ greska: "Korisnik nije pronađen." });
			}
		} catch (err) {
			console.error("Greška na serveru:", (err as Error).message);
			res.status(500).json({ greska: "Greška na serveru." });
		}
	});

	server.get("/servis/korisnici/:korime/zahtjev", async (req, res) => {
		const korime = req.params.korime;

		try {
			const korisnik = await korisnikDAO.daj(korime);
			if (korisnik) {
				res.status(200).json({
					zahtjevZaPristup: korisnik.zahtjevZaPristup,
					pristup: korisnik.pristup,
				});
			} else {
				res.status(404).json({ greska: "Korisnik nije pronađen." });
			}
		} catch (err) {
			console.error("Greška na serveru:", (err as Error).message);
			res.status(500).json({ greska: "Greška na serveru." });
		}
	});

	server.post(
		"/servis/korisnici/:korime/prijava",
		restKorisnik.getKorisnikPrijava.bind(restKorisnik)
	);
	server.post(
		"/servis/korisnici/:korime",
		restKorisnik.postKorisnik.bind(restKorisnik)
	);
	server.put(
		"/servis/korisnici/:korime",
		restKorisnik.putKorisnik.bind(restKorisnik)
	);
	server.delete("/servis/korisnici/:korime", (req, res) => {
		restKorisnik.deleteKorisnik(req, res);
	});

	let restServis = new RestServis();
	server.get("/servis/osoba/:id", restServis.getOsoba.bind(restServis));
	server.post("/servis/osoba/:id", restServis.postOsoba.bind(restServis));
	server.put("/servis/osoba/:id", restServis.putOsoba.bind(restServis));
	server.delete("/servis/osoba/:id", restServis.deleteOsobaId.bind(restServis));

	server.get("/servis/osoba", (req, res) => {
		restServis.getSveOsobe(req, res);
	});

	server.post("/servis/osoba", (req, res) => {
		restServis.addOsoba(req, res);
	});

	server.put("/servis/osoba", (req, res) => {
		restServis.putOsoba(req, res);
	});

	server.delete("/servis/osoba", (req, res) => {
		restServis.deleteOsoba(req, res);
	});

	server.get("/servis/osoba/:id/film", (req, res) => {
		restServis.getFilmoveZaOsobu(req, res);
	});

	server.post(
		"/servis/osoba/:id/film",
		restServis.postFilmoveZaOsobu.bind(restServis)
	);

	server.put("/servis/osoba/:id/film", (req, res) => {
		restServis.putPoveziOsobuSaFilmovima(req, res);
	});

	server.delete("/servis/osoba/:id/film", (req, res) => {
		restServis.deleteVezuOsobeSaFilmovima(req, res);
	});

	server.get("/servis/film", (req, res) => {
		restServis.getFilmove(req, res);
	});

	server.post("/servis/film", (req, res) => {
		restServis.postFilm(req, res);
	});

	server.post("/servis/film", async (req, res) => {
		try {
			const id = restServis.postFilm(req, res);

			res.status(200).json({ id });
		} catch (error) {
			console.error("Greška pri dodavanju filma na serveru:", error);
			res.status(500).json({ greska: "Dodavanje filma nije uspjelo." });
		}
	});

	server.put("/servis/film", (req, res) => {
		restServis.putFilm(req, res);
	});

	server.delete("/servis/film", (req, res) => {
		restServis.deleteFilm(req, res);
	});

	server.get("/servis/film/:id", (req, res) => {
		restServis.getFilm(req, res);
	});

	server.post("/servis/film/:id", (req, res) => {
		restServis.postFilmId(req, res);
	});

	server.put("/servis/film/:id", (req, res) => {
		restServis.postFilmId(req, res);
	});

	server.delete("/servis/film/:id", (req, res) => {
		restServis.deleteFilmAkoNemaVeza(req, res);
	});

	server.get("/servis/korisnici/:korime/tip", async (req, res) => {
		try {
			const korime = req.params.korime;
			const tipKorisnika = await korisnikDAO.dajTipKorisnika(korime);

			if (tipKorisnika !== null) {
				res.json({ tip_korisnika: tipKorisnika });
			} else {
				res.status(404).send("Korisnik nije pronađen ili nema tip.");
			}
		} catch (error) {
			res.status(500).send("Greška na poslužitelju.");
		}
	});

	server.get("/servis/zadnja-osoba", (req, res) =>
		restServis.getZadnjaOsoba(req, res)
	);

	server.get("/servis/filmovi", async (req, res) => {
		//console.log("Primljen zahtjev:", req.query);

		const servisDAO = new ServisDAO();

		try {
			const datumOd = req.query["datumOd"] as string | undefined;
			const datumDo = req.query["datumDo"] as string | undefined;

			const brojFilmova = await servisDAO.brojFilmovePoDatumu(datumOd, datumDo);

			res.status(200).json({ ukupno: brojFilmova });
		} catch (error) {
			console.error("Greška prilikom dobavljanja broja filmova:", error);
			res.status(500).json({ poruka: "Došlo je do greške na serveru." });
		}
	});
}

function pripremiPutanjeAutentifikacija() {
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc, port);

	console.log("Postavljam putanje za autentifikaciju...");

	server.get("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
	server.post(
		"/registracija",
		htmlUpravitelj.registracija.bind(htmlUpravitelj)
	);
	server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
	server.get("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
	server.post("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
}

function UploadSLike(this: any) {
	const mapaZaUpload = path.resolve(
		__dirname(),
		"../../../angular/projects/kmisic22/src/app/uploads"
	);
	if (!fs.existsSync(mapaZaUpload)) {
		fs.mkdirSync(mapaZaUpload, { recursive: true });
	}

	const servisDAO = new ServisDAO();

	server.post("/upload", (req, res) => {
		const contentType = req.headers["content-type"];

		if (!contentType || !contentType.includes("multipart/form-data")) {
			res.status(400).send("Neispravan format zahtjeva");
			console.error("[ERROR] Neispravan format zahtjeva");
			return;
		}

		const granica = `--${contentType.split("boundary=")[1]}`;

		let tijelo = Buffer.from("");

		req.on("data", (dio) => {
			tijelo = Buffer.concat([tijelo, dio]);
		});

		req.on("end", async () => {
			const dijelovi = tijelo
				.toString("latin1")
				.split(granica)
				.filter((dio) => dio.trim() !== "--");

			const filePart = dijelovi.find((dio) =>
				dio.includes('Content-Disposition: form-data; name="image"')
			);

			if (!filePart) {
				res.status(400).send("Datoteka nije pronađena u zahtjevu");
				console.error("[ERROR] Datoteka nije pronađena u zahtjevu");
				return;
			}

			const fileStart = filePart.indexOf("\r\n\r\n") + 4;
			const fileEnd = filePart.lastIndexOf("\r\n");

			if (fileStart < 4 || fileEnd <= fileStart) {
				res.status(400).send("Neispravni podaci datoteke");
				console.error("[ERROR] Neispravni podaci datoteke");
				return;
			}

			const fileBuffer = Buffer.from(
				filePart.slice(fileStart, fileEnd),
				"binary"
			);

			const originalNameMatch = filePart.match(/filename="(.+?)"/);
			let originalName: string =
				originalNameMatch && originalNameMatch[1]
					? originalNameMatch[1]
					: `slika-${Date.now()}`;

			if (!path.extname(originalName)) {
				const mimeTypeMatch: RegExpMatchArray | null =
					filePart.match(/Content-Type: (.+)/);
				const ekstenzije: { [key: string]: string } = {
					"image/jpeg": ".jpg",
					"image/png": ".png",
					"image/gif": ".gif",
				};
				const mimeType =
					mimeTypeMatch && mimeTypeMatch[1] ? mimeTypeMatch[1].trim() : null;
				const ekstenzija =
					mimeType && ekstenzije[mimeType] ? ekstenzije[mimeType] : ".bin";
				originalName += ekstenzija;
			}

			const putanjaDoDatoteke = path.join(mapaZaUpload, originalName);

			try {
				fs.writeFileSync(putanjaDoDatoteke, fileBuffer);

				await servisDAO.dodajSliku(originalName);

				res.status(200).json({
					poruka: "Datoteka uspješno učitana",
					nazivDatoteke: originalName,
					putanja: `/uploads/${originalName}`,
				});
			} catch (greska) {
				console.error(
					`[ERROR] Greška pri spremanju datoteke ili baze: ${greska}`
				);
				res.status(500).send("Greška pri spremanju datoteke ili baze");
			}
		});

		req.on("error", (err) => {
			console.error(`[ERROR] Greška pri obradi zahtjeva: ${err}`);
			res.status(500).send("Greška pri obradi zahtjeva");
		});
	});

	server.get("/images", async (req, res) => {
		try {
			const slike = await servisDAO.dajSveSlike();
			res.status(200).json(slike);
		} catch (greska) {
			console.error(`[ERROR] Greška pri dohvaćanju slika iz baze: ${greska}`);
			res.status(500).send("Greška pri dohvaćanju slika iz baze");
		}
	});

	server.use(
		"/uploads",
		express.static(mapaZaUpload, {
			setHeaders: (res) => {
				res.set("Access-Control-Allow-Origin", "http://localhost:4200");
				res.set("Access-Control-Allow-Credentials", "true");
			},
		})
	);

	server.get("/folder-images", (req, res) => {
		const mapaZaUpload = path.resolve(
			__dirname(),
			"../../../angular/projects/kmisic22/src/app/uploads"
		);

		fs.readdir(mapaZaUpload, (err, files) => {
			if (err) {
				console.error(`[ERROR] Greška pri čitanju foldera: ${err}`);
				res.status(500).send("Greška pri čitanju foldera.");
				return;
			}

			const slike = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
			res.json(slike);
		});
	});
}
