import { FilmoviTmdbI, ZanrTmdbI } from "../servisI/tmdbI.js";
import { dajNasumceBroj } from "../zajednicko/kodovi.js";
import { Request, Response } from "express";
import { TMDBklijent } from "./klijentTMDB.js";
import * as jwt from "../zajednicko/jwt.js";

export class RestTMDB {
	private tmdbKlijent: TMDBklijent;
	private tajniKljucJWT: string;

	constructor(api_kljuc: string, tajniKljucJWT: string) {
		this.tmdbKlijent = new TMDBklijent(api_kljuc);
		this.tajniKljucJWT = tajniKljucJWT;
		console.log(api_kljuc);
	}

	getFilmoviJWT(zahtjev: Request, odgovor: Response) {
		if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
			odgovor.status(401);
			odgovor.json({ greska: "neaoutorizirani pristup" });
		} else {
			this.getFilmovi(zahtjev, odgovor);
		}
	}

	async dodajFilm(zahtjev: Request, odgovor: Response) {
		console.log(zahtjev.body);
		if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
			odgovor.status(401);
			odgovor.json({ greska: "neaoutorizirani pristup" });
		} else {
			odgovor.json({ ok: "OK" });
		}
	}

	getZanr(zahtjev: Request, odgovor: Response) {
		console.log(this);
		this.tmdbKlijent
			.dohvatiZanrove()
			.then((zanrovi: Array<ZanrTmdbI>) => {
				odgovor.type("application/json");
				odgovor.json(zanrovi);
			})
			.catch((greska) => {
				odgovor.json(greska);
			});
	}

	getFilmovi(zahtjev: Request, odgovor: Response) {
		console.log(this);
		odgovor.type("application/json");

		let stranica = zahtjev.query["stranica"];
		let trazi = zahtjev.query["trazi"];

		if (
			stranica == null ||
			trazi == null ||
			typeof stranica != "string" ||
			typeof trazi != "string"
		) {
			odgovor.status(417);
			odgovor.send({ greska: "neocekivani podaci" });
			return;
		}

		this.tmdbKlijent
			.pretraziFilmovePoNazivu(trazi, parseInt(stranica))
			.then((filmovi: FilmoviTmdbI) => {
				odgovor.send(filmovi);
			})
			.catch((greska) => {
				odgovor.json(greska);
			});
	}

	async dohvatiNasumceFilm(zahtjev: Request, odgovor: Response) {
		let zanr = zahtjev.query["zanr"] ?? "";
		if (typeof zanr == "string") {
			this.tmdbKlijent
				.pretraziFilmovePoNazivu(zanr, 1)
				.then((filmovi: FilmoviTmdbI) => {
					let rez = [
						filmovi.results[dajNasumceBroj(0, 20)],
						filmovi.results[dajNasumceBroj(0, 20)],
					];
					odgovor.json(rez);
				})
				.catch((greska) => {
					odgovor.json(greska);
				});
		} else {
			odgovor.json({ greska: "fali žanr" });
		}
	}
}
