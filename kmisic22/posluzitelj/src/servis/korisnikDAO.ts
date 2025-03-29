import { KorisnikI } from "../servisI/korisniciI";
import Baza from "../zajednicko/sqliteBaza.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class KorisnikDAO {
	private baza: Baza;

	constructor() {
		const bazaPath = path.resolve(
			__dirname,
			"../../podaci/RWA2024kmisic22_web.sqlite"
		);
		if (!fs.existsSync(bazaPath)) {
			console.log("Baza ne postoji, kreiram novu...");
		}

		this.baza = new Baza(bazaPath);
	}

	async dajSve(): Promise<Array<KorisnikI>> {
		let sql = "SELECT * FROM korisnik;";
		var podaci = (await this.baza.dajPodatkePromise(
			sql,
			[]
		)) as Array<KorisnikI>;
		let rezultat = new Array<KorisnikI>();
		for (let p of podaci) {
			let k: KorisnikI = {
				ime: p["ime"],
				prezime: p["prezime"],
				korime: p["korime"],
				lozinka: p["lozinka"],
				email: p["email"],
				adresa: p["adresa"] || null,
				brojMobitela: p["brojMobitela"] || null,
				spol: p["spol"] || null,
				zahtjevZaPristup: p["zahtjevZaPristup"],
				pristup: p["pristup"],
			};
			rezultat.push(k);
		}
		return rezultat;
	}

	async daj(korime: string): Promise<KorisnikI | null> {
		let sql = "SELECT * FROM korisnik WHERE korime=?;";
		var podaci = (await this.baza.dajPodatkePromise(sql, [
			korime,
		])) as Array<KorisnikI>;

		if (podaci.length == 1 && podaci[0] != undefined) {
			let p = podaci[0];
			let k: KorisnikI = {
				ime: p["ime"],
				prezime: p["prezime"],
				korime: p["korime"],
				lozinka: p["lozinka"],
				email: p["email"],
				adresa: p["adresa"] || null,
				brojMobitela: p["brojMobitela"] || null,
				spol: p["spol"] || null,
				zahtjevZaPristup: p["zahtjevZaPristup"],
				pristup: p["pristup"],
			};
			return k;
		}
		return null;
	}

	dodaj(korisnik: KorisnikI) {
		console.log("Podaci prije obrade:", korisnik);

		let sql = `
			INSERT INTO korisnik (
				ime, prezime, adresa, korime, lozinka, email, brojMobitela, spol, 
				tip_korisnika_id, pristup, zahtjevZaPristup
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;

		let podaci = [
			korisnik.ime || null,
			korisnik.prezime || null,
			korisnik.adresa || null,
			korisnik.korime || null,
			korisnik.lozinka || null,
			korisnik.email || null,
			korisnik.brojMobitela || null,
			korisnik.spol || null,
			1,
			2,
			"zahtjevNijePoslan",
		];

		console.log("Podaci za unos u bazu:", podaci);

		try {
			this.baza.ubaciAzurirajPodatke(sql, podaci);
			return true;
		} catch (err) {
			console.error("Greška pri unosu korisnika:", err);
			throw new Error("Unos korisnika nije uspio!");
		}
	}

	obrisi(korime: string) {
		let sql = "DELETE FROM korisnik WHERE korime=?";
		this.baza.ubaciAzurirajPodatke(sql, [korime]);
		return true;
	}

	azuriraj(korime: string, korisnik: KorisnikI) {
		const sql = `
			UPDATE korisnik
			SET ime = ?, prezime = ?, lozinka = ?, email = ?, adresa = ?, brojMobitela = ?, spol = ?, 
				pristup = ?, zahtjevZaPristup = ?
			WHERE korime = ?;
		`;
		const podaci = [
			korisnik.ime,
			korisnik.prezime,
			korisnik.lozinka,
			korisnik.email,
			korisnik.adresa,
			korisnik.brojMobitela,
			korisnik.spol,
			korisnik.pristup,
			korisnik.zahtjevZaPristup,
			korime,
		];
		return this.baza.ubaciAzurirajPodatke(sql, podaci);
	}

	async dajTipKorisnika(korime: string): Promise<number | null> {
		const sql = `SELECT tip_korisnika_id FROM korisnik WHERE korime = ?;`;

		const podaci: { tip_korisnika_id: number }[] =
			(await this.baza.dajPodatkePromise(sql, [korime])) as {
				tip_korisnika_id: number;
			}[];

		if (
			podaci.length > 0 &&
			podaci[0] &&
			podaci[0].tip_korisnika_id !== undefined
		) {
			return podaci[0].tip_korisnika_id;
		}

		return null;
	}
}
