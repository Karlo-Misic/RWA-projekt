import { ServisDAO } from "./servisDAO.js";
import { Request, Response } from "express";

export class RestServis {
	private sdao;

	constructor() {
		this.sdao = new ServisDAO();
	}

	getOsoba(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		let id = zahtjev.params["id"];
		if (id == undefined) {
			odgovor.status(422).send({ greska: "Neočekivani podaci: Nedostaje ID." });
			return;
		}
		this.sdao
			.daj(id)
			.then((osoba) => {
				if (osoba) {
					odgovor.status(200).send(osoba);
				} else {
					odgovor.status(404).send({ greska: "Osoba nije pronađena" });
				}
			})
			.catch((greska) => {
				console.error(greska);
				odgovor.status(400).send({ greska: "Greška prilikom dohvata osobe" });
			});
	}

	postOsoba(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	putOsoba(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	deleteOsoba(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	deleteOsobaId(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");

		const osobaIdParam = zahtjev.params["id"];

		if (!osobaIdParam) {
			odgovor.status(422).send({ greska: "Nedostaje ID osobe." });
			return;
		}

		const osobaId = parseInt(osobaIdParam, 10);

		if (isNaN(osobaId)) {
			odgovor.status(422).send({ greska: "ID osobe nije validan broj." });
			return;
		}

		this.sdao
			.obrisiOsobuISveVeze(osobaId)
			.then(() => {
				odgovor.status(200).send({ status: "uspjeh" });
			})
			.catch((greska: any) => {
				console.error("Greška pri brisanju osobe i veza:", greska);
				odgovor
					.status(400)
					.send({ greska: "Greška pri brisanju osobe i veza." });
			});
	}

	getSveOsobe(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		const stranica = parseInt(zahtjev.query["stranica"] as string) || 1;

		if (isNaN(stranica) || stranica < 1) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: Neispravan broj stranice." });
			return;
		}

		this.sdao
			.dajSveStranica(stranica)
			.then((osobe) => {
				odgovor.status(200).json(osobe);
			})
			.catch((greska) => {
				console.error(greska);
				odgovor
					.status(400)
					.send({ greska: "Greška prilikom dohvata podataka." });
			});
	}

	async addOsoba(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		const osoba = zahtjev.body;

		const osobaZaDodavanje = {
			id: osoba.id || null,
			ime_i_prezime: osoba.ime_i_prezime || "N/A",
			poznat_po: osoba.poznat_po || "N/A",
			popularnost: osoba.popularnost !== undefined ? osoba.popularnost : 0,
			slika: osoba.slika || null,
			lik: osoba.lik || "N/A",
		};

		try {
			await this.sdao.dodaj(osobaZaDodavanje);
			odgovor.status(201).send({ status: "uspjeh" });
		} catch (greska: any) {
			console.error("Greška pri dodavanju osobe:", greska);
			odgovor.status(400).send({ greska: "Greška prilikom dodavanja osobe." });
		}
	}

	getFilmoveZaOsobu(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");

		const osobaId = zahtjev.params["id"];
		const stranica = parseInt(zahtjev.query["stranica"] as string) || 1;

		if (!osobaId) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: Nedostaje ID osobe." });
			return;
		}

		if (stranica < 1) {
			odgovor.status(422).send({
				greska: "Neočekivani podaci: Stranica mora biti pozitivan broj.",
			});
			return;
		}

		this.sdao
			.dohvatiFilmoveZaOsobu(osobaId, stranica)
			.then((filmovi) => {
				odgovor.status(200).json(filmovi);
			})
			.catch((greska: any) => {
				console.error("Greška prilikom dohvata filmova:", greska);
				odgovor
					.status(400)
					.send({ greska: "Greška prilikom dohvata filmova." });
			});
	}

	postFilmoveZaOsobu(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	putPoveziOsobuSaFilmovima(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		const osobaIdParam = zahtjev.params["id"];

		if (!osobaIdParam) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: Nedostaje ID osobe." });
			return;
		}

		const osobaId = parseInt(osobaIdParam, 10);

		if (isNaN(osobaId)) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: ID osobe nije validan broj." });
			return;
		}

		const filmovi = zahtjev.body.filmovi;

		if (!filmovi || !Array.isArray(filmovi) || filmovi.length === 0) {
			odgovor.status(422).send({
				greska: "Neočekivani podaci: Nedostaju validni ID-evi filmova.",
			});
			return;
		}

		this.sdao
			.poveziOsobuSaFilmovima(osobaId, filmovi)
			.then(() => {
				odgovor.status(201).send({ status: "uspjeh" });
			})
			.catch((greska: any) => {
				console.error("Greška prilikom povezivanja osobe s filmovima:", greska);
				odgovor
					.status(400)
					.send({ greska: "Greška prilikom povezivanja osobe s filmovima." });
			});
	}

	deleteVezuOsobeSaFilmovima(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		const osobaIdParam = zahtjev.params["id"];

		if (!osobaIdParam) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: Nedostaje ID osobe." });
			return;
		}

		const osobaId = parseInt(osobaIdParam, 10);

		if (isNaN(osobaId)) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: ID osobe nije validan broj." });
			return;
		}

		const filmovi = zahtjev.body.filmovi;

		if (!filmovi || !Array.isArray(filmovi) || filmovi.length === 0) {
			odgovor.status(422).send({
				greska: "Neočekivani podaci: Nedostaju validni ID-evi filmova.",
			});
			return;
		}

		this.sdao
			.obrisiVezuOsobeSaFilmovima(osobaId, filmovi)
			.then(() => {
				odgovor.status(201).send({ status: "uspjeh" });
			})
			.catch((greska: any) => {
				console.error(
					"Greška prilikom brisanja veze osobe s filmovima:",
					greska
				);
				odgovor
					.status(400)
					.send({ greska: "Greška prilikom brisanja veze osobe s filmovima." });
			});
	}

	getFilmove(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");

		const stranicaParam = zahtjev.query["stranica"];
		const datumOdParam = zahtjev.query["datumOd"];
		const datumDoParam = zahtjev.query["datumDo"];

		const stranica = parseInt(stranicaParam as string, 10) || 1;
		const datumOd = datumOdParam
			? parseInt(datumOdParam as string, 10)
			: undefined;
		const datumDo = datumDoParam
			? parseInt(datumDoParam as string, 10)
			: undefined;

		if (isNaN(stranica) || stranica < 1) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: Neispravan broj stranice." });
			return;
		}

		this.sdao
			.dohvatiFilmove(stranica, datumOd, datumDo)
			.then((filmovi) => {
				odgovor.status(200).send(filmovi);
			})
			.catch((greska: any) => {
				console.error("Greška pri dohvatu filmova:", greska);
				odgovor.status(400).send({ greska: "Greška pri dohvatu filmova." });
			});
	}

	postFilm(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");

		const film = zahtjev.body;

		const filmZaDodavanje = {
			originalni_naslov: film.originalni_naslov || "N/A",
			naslov: film.naslov || "N/A",
			popularnost: film.popularnost !== undefined ? film.popularnost : 0,
			slika_postera: film.slika_postera || null,
			jezik: film.jezik || "N/A",
			datum_izdavanja: film.datum_izdavanja || 0,
			opis_filma: film.opis_filma || "Nema opisa",
		};

		this.sdao
			.dodajFilm(filmZaDodavanje)
			.then((id) => {
				odgovor.status(201).send({ status: "uspjeh", id });
			})
			.catch((greska: any) => {
				console.error("Greška prilikom dodavanja filma:", greska);
				odgovor
					.status(400)
					.send({ greska: "Greška prilikom dodavanja filma." });
			});
	}

	putFilm(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	deleteFilm(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	getFilm(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");

		const filmIdParam = zahtjev.params["id"];

		if (!filmIdParam) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: Nedostaje ID filma." });
			return;
		}

		const filmId = parseInt(filmIdParam, 10);

		if (isNaN(filmId)) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: ID filma nije validan broj." });
			return;
		}

		this.sdao
			.dohvatiFilm(filmId)
			.then((film) => {
				odgovor.status(200).send(film);
			})
			.catch((greska: any) => {
				console.error("Greška pri dohvatu filma:", greska);
				odgovor
					.status(404)
					.send({ greska: `Film s ID-om ${filmId} nije pronađen.` });
			});
	}

	postFilmId(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	putFilmId(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		odgovor.status(405).send({ greska: "Zabranjena metoda" });
	}

	deleteFilmAkoNemaVeza(zahtjev: Request, odgovor: Response) {
		odgovor.type("application/json");
		const filmIdParam = zahtjev.params["id"];

		if (!filmIdParam) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: Nedostaje ID filma." });
			return;
		}

		const idFilma = parseInt(filmIdParam, 10);

		if (isNaN(idFilma)) {
			odgovor
				.status(422)
				.send({ greska: "Neočekivani podaci: ID filma nije validan broj." });
			return;
		}

		this.sdao
			.obrisiFilmAkoNemaVeza(idFilma)
			.then(() => {
				odgovor.status(201).send({ status: "uspjeh" });
			})
			.catch((greska: any) => {
				console.error("Greška prilikom brisanja filma:", greska);
				odgovor.status(400).send({ greska: "Greška prilikom brisanja filma." });
			});
	}

	getZadnjaOsoba(zahtjev: Request, odgovor: Response) {
		this.sdao
			.dajSveStranica(1)
			.then((osobe) => {
				if (osobe.length > 0) {
					const zadnjaOsoba = osobe[osobe.length - 1];
					odgovor.status(200).json(zadnjaOsoba);
				} else {
					odgovor.status(404).send({ greska: "Nema osoba u bazi." });
				}
			})
			.catch((greska) => {
				console.error("Greška pri dohvaćanju zadnje osobe:", greska);
				odgovor.status(400).send({ greska: "Greška na serveru." });
			});
	}
}
