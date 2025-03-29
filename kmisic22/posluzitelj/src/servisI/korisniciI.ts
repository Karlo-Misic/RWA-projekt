export interface KorisnikI {
	ime: string;
	prezime: string;
	korime: string;
	lozinka: string | null;
	email: string;
	adresa: string | null;
	brojMobitela: string | null;
	spol: string | null;
	zahtjevZaPristup: number | string;
	pristup: number;
}
