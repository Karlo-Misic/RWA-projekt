import { OsobaI } from "../servisI/osobeI.js";
import Baza from "../zajednicko/sqliteBaza.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ServisDAO {
	private baza: Baza;

	constructor() {
		const bazaPath = path.resolve(
			__dirname,
			"..//..//podaci/RWA2024kmisi22_servis.sqlite"
		);
		if (!fs.existsSync(bazaPath)) {
			console.log("Baza ne postoji, kreiram novu...");
		}

		this.baza = new Baza(bazaPath);
	}

	async dajSveStranica(stranica: number): Promise<Array<OsobaI>> {
		let offset = 20 * (stranica - 1);
		let sql = "SELECT * FROM osobe LIMIT 20 OFFSET ?;";
		let podaci = (await this.baza.dajPodatkePromise(sql, [
			offset,
		])) as Array<OsobaI>;
		let rezultat = podaci.map((p) => ({
			id: p["id"],
			ime_i_prezime: p["ime_i_prezime"],
			poznat_po: p["poznat_po"],
			popularnost: p["popularnost"],
			slika: p["slika"],
			lik: p["lik"],
		}));
		return rezultat;
	}

	async daj(id: string): Promise<OsobaI | null> {
		let sql = "SELECT * FROM osobe WHERE id=?;";
		var podaci = (await this.baza.dajPodatkePromise(sql, [
			id,
		])) as Array<OsobaI>;

		if (podaci.length == 1 && podaci[0] != undefined) {
			let p = podaci[0];
			let o: OsobaI = {
				id: p["id"],
				ime_i_prezime: p["ime_i_prezime"],
				poznat_po: p["poznat_po"],
				popularnost: p["popularnost"],
				slika: p["slika"],
				lik: p["lik"],
			};
			return o;
		}

		return null;
	}

	dodaj(osoba: OsobaI) {
		let sql = `
      INSERT INTO osobe (
        id, ime_i_prezime, poznat_po, popularnost, slika, lik
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
		let podaci = [
			osoba.id,
			osoba.ime_i_prezime || null,
			osoba.poznat_po || null,
			osoba.popularnost,
			osoba.slika,
			osoba.lik,
		];
		this.baza.ubaciAzurirajPodatke(sql, podaci);
		return true;
	}

	async obrisiOsobuISveVeze(osobaId: number): Promise<void> {
		const deleteVezeSql = `
			DELETE FROM uloga
			WHERE id_osobe = ?;
		`;
		const deleteOsobaSql = `
			DELETE FROM osobe
			WHERE id = ?;
		`;
		const obrisiNepovezaneFilmoveSql = `
			DELETE FROM filmovi
			WHERE id NOT IN (SELECT DISTINCT id_filmovi FROM uloga);
		`;

		try {
			await this.baza.ubaciAzurirajPodatke(deleteVezeSql, [osobaId]);

			const result = await this.baza.ubaciAzurirajPodatke(deleteOsobaSql, [
				osobaId,
			]);

			if (result.changes === 0) {
				throw new Error(`Osoba sa ID-jem ${osobaId} ne postoji.`);
			}

			await this.baza.ubaciAzurirajPodatke(obrisiNepovezaneFilmoveSql, []);

			console.log(`Osoba sa ID-jem ${osobaId} i sve njene veze su obrisane.`);
		} catch (error) {
			console.error("Greška pri brisanju osobe i veza:", error);
			throw new Error("Greška pri brisanju osobe i veza.");
		}
	}

	azuriraj(korime: string, osoba: OsobaI) {
		let sql = `UPDATE korisnik SET ime=?, prezime=?, lozinka=?, email=? WHERE korime=?`;
		let podaci = [
			osoba.ime_i_prezime || null,
			osoba.poznat_po || null,
			osoba.popularnost,
			osoba.slika,
			osoba.lik,
			korime,
		];
		this.baza.ubaciAzurirajPodatke(sql, podaci);
		return true;
	}

	dohvatiFilmoveZaOsobu(osobaId: string, stranica: number): Promise<any[]> {
		const sql = `
            SELECT filmovi.id, filmovi.naslov, filmovi.originalni_naslov, filmovi.popularnost, 
                   filmovi.slika_postera, filmovi.jezik, filmovi.datum_izdavanja, filmovi.opis_filma
            FROM uloga
            JOIN filmovi ON uloga.id_filmovi = filmovi.id
            WHERE uloga.id_osobe = ?
            LIMIT 20 OFFSET ?`;
		const offset = (stranica - 1) * 20;

		return new Promise((resolve, reject) => {
			try {
				const rezultati = this.baza.dajPodatke(sql, [osobaId, offset]);
				resolve(rezultati);
			} catch (err) {
				console.error("Greška pri dohvatu filmova za osobu:", err);
				reject(err);
			}
		});
	}

	poveziOsobuSaFilmovima(osobaId: number, filmovi: number[]): Promise<void> {
		const provjeriOsobuSql = `SELECT COUNT(*) AS broj FROM osobe WHERE id = ?`;
		const provjeriFilmSql = `SELECT COUNT(*) AS broj FROM filmovi WHERE id = ?`;
		const provjeriVezuSql = `
            SELECT COUNT(*) AS broj
            FROM uloga
            WHERE id_osobe = ? AND id_filmovi = ?`;
		const ubaciSql = `
            INSERT INTO uloga (id_osobe, id_filmovi, lik)
            VALUES (?, ?, ?)`;

		return new Promise(async (resolve, reject) => {
			try {
				const osobaRezultat = this.baza.dajPodatke(provjeriOsobuSql, [
					osobaId,
				]) as Array<{ broj: number }>;
				if (!osobaRezultat[0] || osobaRezultat[0].broj === 0) {
					reject(new Error(`Osoba s ID-om ${osobaId} ne postoji.`));
					return;
				}
				for (const filmId of filmovi) {
					const filmRezultat = this.baza.dajPodatke(provjeriFilmSql, [
						filmId,
					]) as Array<{ broj: number }>;
					if (!filmRezultat[0] || filmRezultat[0].broj === 0) {
						reject(new Error(`Film s ID-om ${filmId} ne postoji.`));
						return;
					}

					const vezaRezultat = this.baza.dajPodatke(provjeriVezuSql, [
						osobaId,
						filmId,
					]) as Array<{ broj: number }>;
					if (vezaRezultat[0] && vezaRezultat[0].broj > 0) {
						console.log(
							`Veza između osobe ${osobaId} i filma ${filmId} već postoji.`
						);
					} else {
						this.baza.ubaciAzurirajPodatke(ubaciSql, [
							osobaId,
							filmId,
							"Uloga",
						]);
					}
				}

				resolve();
			} catch (greska) {
				console.error("Greška prilikom povezivanja osobe s filmovima:", greska);
				reject(greska);
			}
		});
	}

	obrisiVezuOsobeSaFilmovima(
		osobaId: number,
		filmovi: number[]
	): Promise<void> {
		const sql = `
            DELETE FROM uloga
            WHERE id_osobe = ? AND id_filmovi = ?`;

		return new Promise((resolve, reject) => {
			try {
				filmovi.forEach((filmId) => {
					this.baza.ubaciAzurirajPodatke(sql, [osobaId, filmId]);
				});

				resolve();
			} catch (greska) {
				console.error(
					"Greška prilikom brisanja veze između osobe i filmova:",
					greska
				);
				reject(greska);
			}
		});
	}

	dohvatiFilmove(
		stranica: number,
		datumOd?: number,
		datumDo?: number
	): Promise<any[]> {
		const osnovniSql = `
            SELECT id, originalni_naslov, naslov, popularnost, slika_postera, jezik, datum_izdavanja, opis_filma
            FROM filmovi
        `;
		let uvjeti = [];
		let parametri: (number | string)[] = [];

		if (datumOd) {
			uvjeti.push(`datum_izdavanja >= ?`);
			parametri.push(new Date(datumOd).toISOString());
		}
		if (datumDo) {
			uvjeti.push(`datum_izdavanja <= ?`);
			parametri.push(new Date(datumDo).toISOString());
		}

		const sql = `${osnovniSql} ${
			uvjeti.length > 0 ? `WHERE ${uvjeti.join(" AND ")}` : ""
		} LIMIT 20 OFFSET ?`;

		const offset = (stranica - 1) * 20;
		parametri.push(offset);

		return new Promise((resolve, reject) => {
			try {
				const rezultati = this.baza.dajPodatke(sql, parametri);
				resolve(rezultati);
			} catch (greska) {
				console.error("Greška pri dohvatu filmova:", greska);
				reject(greska);
			}
		});
	}
	async dodajFilm(film: {
		originalni_naslov: string;
		naslov: string;
		popularnost: string;
		slika_postera: string;
		jezik: string;
		datum_izdavanja: string;
		opis_filma: string;
	}): Promise<number> {
		const sql = `
			INSERT INTO filmovi (
				originalni_naslov,
				naslov,
				popularnost,
				slika_postera,
				jezik,
				datum_izdavanja,
				opis_filma
			) VALUES (?, ?, ?, ?, ?, ?, ?)
		`;

		const podaci = [
			film.originalni_naslov,
			film.naslov,
			film.popularnost,
			film.slika_postera,
			film.jezik,
			film.datum_izdavanja,
			film.opis_filma,
		];

		try {
			await this.baza.ubaciAzurirajPodatke(sql, podaci);

			const idSql = `SELECT last_insert_rowid() AS id;`;
			const rezultat = await this.baza.dajPodatkePromise(idSql, []);

			const rezultatArray = rezultat as Array<{ id: number }>;
			const id = rezultatArray[0]?.id;

			if (!id) {
				console.error("Nije moguće dohvatiti ID zadnje umetnutog filma.");
				throw new Error("Nije moguće dohvatiti ID zadnje umetnutog filma.");
			}

			return id;
		} catch (greska) {
			console.error("Greška pri dodavanju filma:", greska);
			throw new Error("Dodavanje filma nije uspjelo.");
		}
	}

	dohvatiFilm(id: number): Promise<any> {
		const sql = `
            SELECT id, originalni_naslov, naslov, popularnost, slika_postera, jezik, datum_izdavanja, opis_filma
            FROM filmovi
            WHERE id = ?`;

		return new Promise((resolve, reject) => {
			try {
				const rezultati = this.baza.dajPodatke(sql, [id]);
				if (rezultati.length > 0) {
					resolve(rezultati[0]);
				} else {
					reject(new Error(`Film s ID-om ${id} nije pronađen.`));
				}
			} catch (greska) {
				console.error("Greška pri dohvatu filma:", greska);
				reject(greska);
			}
		});
	}

	obrisiFilmAkoNemaVeza(idFilma: number): Promise<void> {
		const provjeriSql = `
            SELECT COUNT(*) AS broj
            FROM uloga
            WHERE id_filmovi = ?`;
		const obrisiSql = `
            DELETE FROM filmovi
            WHERE id = ?`;

		return new Promise((resolve, reject) => {
			try {
				const rezultat = this.baza.dajPodatke(provjeriSql, [idFilma]) as Array<{
					broj: number;
				}>;

				if (rezultat && rezultat[0] && rezultat[0].broj > 0) {
					reject(
						new Error(
							`Film s ID-om ${idFilma} ima povezane veze i ne može biti obrisan.`
						)
					);
					return;
				}

				this.baza.ubaciAzurirajPodatke(obrisiSql, [idFilma]);
				resolve();
			} catch (greska) {
				console.error("Greška prilikom brisanja filma:", greska);
				reject(greska);
			}
		});
	}
	async dodajSliku(
		nazivSlike: string,
		osobeId: number = 190
	): Promise<boolean> {
		try {
			const maxIdResult = await this.baza.dajPodatkePromise(
				"SELECT MAX(id) as maxId FROM slike",
				[]
			);
			const maxId =
				Array.isArray(maxIdResult) &&
				maxIdResult.length > 0 &&
				maxIdResult[0]?.maxId !== undefined
					? maxIdResult[0].maxId
					: 0;
			const noviId = maxId + 1;

			const sql = `
			INSERT INTO slike (id, slike, osobe_id) 
			VALUES (?, ?, ?)
		  `;
			const podaci = [noviId, nazivSlike, osobeId];

			await this.baza.ubaciAzurirajPodatke(sql, podaci);
			console.log(
				`Naziv slike '${nazivSlike}' uspješno spremljen u bazu s ID-om ${noviId}.`
			);
			return true;
		} catch (err) {
			console.error("Greška pri spremanju slike u bazu:", err);
			throw new Error("Spremanje slike nije uspjelo!");
		}
	}

	async dajSveSlike(): Promise<
		Array<{ id: number; slike: string; osobe_id: number | null }>
	> {
		const sql = "SELECT * FROM slike;";
		return (await this.baza.dajPodatkePromise(sql, [])) as Array<{
			id: number;
			slike: string;
			osobe_id: number | null;
		}>;
	}

	async brojFilmovePoDatumu(
		datumOd?: string,
		datumDo?: string,
		offset: number = 0,
		limit: number = 20
	): Promise<{ ukupno: number; filmovi: { naziv: string }[] }> {
		let uvjeti = [];
		let parametri: (string | number)[] = [];

		if (datumOd) {
			const parsedDatumOd = new Date(datumOd);
			if (!isNaN(parsedDatumOd.getTime())) {
				uvjeti.push("datum_izdavanja >= ?");
				parametri.push(parsedDatumOd.toISOString());
			}
		}
		if (datumDo) {
			const parsedDatumDo = new Date(datumDo);
			if (!isNaN(parsedDatumDo.getTime())) {
				uvjeti.push("datum_izdavanja <= ?");
				parametri.push(parsedDatumDo.toISOString());
			}
		}

		const whereClause =
			uvjeti.length > 0 ? `WHERE ${uvjeti.join(" AND ")}` : "";

		const sqlBroj = `SELECT COUNT(*) AS ukupno FROM filmovi ${whereClause}`;
		const rezultatBroj = (await this.baza.dajPodatkePromise(
			sqlBroj,
			parametri
		)) as Array<{
			ukupno: number;
		}>;

		const sqlFilmovi = `SELECT naslov FROM filmovi ${whereClause} LIMIT ? OFFSET ?`;
		const filmoviParametri = [...parametri, limit, offset];
		const rezultatFilmovi = (await this.baza.dajPodatkePromise(
			sqlFilmovi,
			filmoviParametri
		)) as Array<{
			naziv: string;
		}>;

		return {
			ukupno: rezultatBroj[0]?.ukupno || 0,
			filmovi: rezultatFilmovi || [],
		};
	}
}
