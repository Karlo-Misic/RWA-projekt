import { FilmoviTmdbI, ZanrTmdbI } from "../servisI/tmdbI.js";

export class TMDBklijent {
	private bazicniURL = "https://api.themoviedb.org/3";
	private apiKljuc: string;
	constructor(apiKljuc: string) {
		this.apiKljuc = apiKljuc;
		
	}

	public async dohvatiZanrove() {
		let resurs = "/genre/movie/list";
		let odgovor = await this.obaviZahtjev(resurs);
		return JSON.parse(odgovor).genres as Array<ZanrTmdbI>;
	}

	public async dohvatiFilm(id: number) {
		let resurs = "/movie/" + id;
		let odgovor = await this.obaviZahtjev(resurs);
		return JSON.parse(odgovor) as FilmoviTmdbI;
	}

	public async pretraziFilmovePoNazivu(trazi: string, stranica: number) {
		let resurs = "/search/movie";
		let parametri = {
			sort_by: "popularity.desc",
			include_adult: false,
			page: stranica,
			query: trazi,
		};

		let odgovor = await this.obaviZahtjev(resurs, parametri);
		return JSON.parse(odgovor) as FilmoviTmdbI;
	}

	private async obaviZahtjev(
		resurs: string,
		parametri: { [kljuc: string]: string | number | boolean } = {}
	) {
		let zahtjev = this.bazicniURL + resurs + "?api_key=" + this.apiKljuc;
		for (let p in parametri) {
			zahtjev += "&" + p + "=" + parametri[p];
		}
		console.log(zahtjev);
		let odgovor = await fetch(zahtjev);
		let rezultat = await odgovor.text();
		return rezultat;
	}
}
