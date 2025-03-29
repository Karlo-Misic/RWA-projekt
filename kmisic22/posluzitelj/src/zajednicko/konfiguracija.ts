import dsPromise from "fs/promises";

type tipKonf = {
	jwtValjanost: string;
	jwtTajniKljuc: string;
	tajniKljucSesija: string;
	tmdbApiKeyV3: string;
	tmdbApiKeyV4: string;
};

export class Konfiguracija {
	private konf: tipKonf;
	constructor() {
		this.konf = this.initKonf();
	}
	private initKonf() {
		return {
			jwtTajniKljuc: "",
			jwtValjanost: "",
			tajniKljucSesija: "",
			tmdbApiKeyV3: "",
			tmdbApiKeyV4: "",
		};
	}
	dajKonf() {
		return this.konf;
	}

	public async ucitajKonfiguraciju() {
		if (process.argv[2] == undefined)
			throw new Error("Nedostaje putanja do konfiguracijske datoteke");
		let putanja: string = process.argv[2];

		console.log(this.konf);
		var podaci = await dsPromise.readFile(putanja, {
			encoding: "utf-8",
		});
		console.log(podaci);
		this.pretvoriJSONkonfig(podaci);
		this.provjeriPodatkeKonfiguracije();
	}

	private pretvoriJSONkonfig(podaci: string) {
		let konf: { [kljuc: string]: string } = {};
		var nizPodataka = podaci.split("\n");
		for (let podatak of nizPodataka) {
			var podatakNiz = podatak.split("#");
			var naziv = podatakNiz[0];
			if (typeof naziv != "string" || naziv == "") continue;
			var vrijednost: string = podatakNiz[1] ?? "";
			konf[naziv] = vrijednost;
		}
		this.konf = konf as tipKonf;
	}

	private provjeriPodatkeKonfiguracije() {
		if (!this.konf.tmdbApiKeyV3 || this.konf.tmdbApiKeyV3.trim() === "") {
			throw new Error("Fali TMDB API ključ u tmdbApiKeyV3");
		}
		if (!this.konf.tmdbApiKeyV4 || this.konf.tmdbApiKeyV4.trim() === "") {
			throw new Error("Fali TMDB API ključ u tmdbApiKeyV4");
		}
		if (!this.konf.jwtValjanost || isNaN(parseInt(this.konf.jwtValjanost))) {
			throw new Error("JWT valjanost nije broj ili nedostaje");
		}
		if (!this.konf.jwtTajniKljuc || this.konf.jwtTajniKljuc.trim() === "") {
			throw new Error("Fali JWT tajni ključ");
		}
		if (
			!this.konf.tajniKljucSesija ||
			this.konf.tajniKljucSesija.trim() === ""
		) {
			throw new Error("Fali tajni ključ sesije");
		}
	}
}
