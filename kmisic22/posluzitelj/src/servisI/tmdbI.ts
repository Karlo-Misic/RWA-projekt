export interface ZanrTmdbI {
	id: number;
	name: string;
}

export interface FilmoviTmdbI {
	page: number;
	results: Array<FilmTmdbI>;
	total_pages: number;
	total_results: number;
}

export interface FilmTmdbI {
	adult: boolean;
	backdrop_path: string;
	genre_ids: Array<number>;
	id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string;
	release_date: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
}

export interface FilmTmdbII {
	id: number;
	originalni_naslov: string;
	naslov: string;
	popularnost: string;
	slika_postera: string;
	jezik: string;
	datum_izdavanja: string;
	opis_filma: string;
}
