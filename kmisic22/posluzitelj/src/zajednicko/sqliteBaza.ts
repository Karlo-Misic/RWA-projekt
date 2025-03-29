import SQLite from "better-sqlite3";

export default class Baza {
	private vezaDB;
	private putanjaSQLliteDatoteka;

	constructor(putanjaSQLliteDatoteka: string) {
		this.putanjaSQLliteDatoteka = putanjaSQLliteDatoteka;
		this.vezaDB = new SQLite(putanjaSQLliteDatoteka);
		this.vezaDB.exec("PRAGMA foreign_keys = ON;");
	}

	spojiSeNaBazu() {
		this.vezaDB = new SQLite(this.putanjaSQLliteDatoteka);
		this.vezaDB.exec("PRAGMA foreign_keys = ON;");
	}

	ubaciAzurirajPodatke(
		sql: string,
		podaci: Array<string | number | null>
	): { affectedRows: number; changes: number } {
		try {
			const rezultat = this.vezaDB.prepare(sql).run(podaci);
			return { affectedRows: rezultat.changes, changes: rezultat.changes };
		} catch (err) {
			console.error("Greška pri izvršavanju upita:", err);
			throw err;
		}
	}

	dajPodatke(sql: string, podaci: Array<string | number>) {
		try {
			const rezultat = this.vezaDB.prepare(sql).all(podaci);
			return rezultat;
		} catch (err) {
			console.error("Greška pri izvršavanju upita:", err);
			throw err;
		}
	}

	dajPodatkePromise(sql: string, podaci: Array<string | number>) {
		return new Promise((uspjeh, greska) => {
			setTimeout(() => {
				try {
					const rezultat = this.vezaDB.prepare(sql).all(podaci);
					uspjeh(rezultat);
				} catch (err) {
					console.error("Greška pri izvršavanju upita:", err);
					greska(err);
				}
			}, 1);
		});
	}

	zatvoriVezu() {
		this.vezaDB.close();
	}
}
