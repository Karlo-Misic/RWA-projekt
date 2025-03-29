import * as kodovi from "../zajednicko/kodovi.js";
export class ServisKlijent {
    baseUrl;
    constructor(portRest) {
        this.baseUrl =
            typeof window !== "undefined" &&
                window.location.hostname === "spider.foi.hr"
                ? `http://spider.foi.hr:${portRest}`
                : `http://localhost:${portRest}`;
    }
    async dodajKorisnika(korisnik) {
        let tijelo = {
            ime: korisnik.ime,
            prezime: korisnik.prezime,
            lozinka: kodovi.kreirajSHA256(korisnik.lozinka, "moja sol"),
            email: korisnik.email,
            korime: korisnik.korime,
            adresa: korisnik.adresa,
            brojMobitela: korisnik.brojMobitela,
            spol: korisnik.spol,
            aktivacijskiKod: -1,
            TOTPkljuc: "",
        };
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = {
            method: "POST",
            body: JSON.stringify(tijelo),
            headers: zaglavlje,
        };
        let odgovor = await fetch(`${this.baseUrl}/servis/korisnici`, parametri);
        if (odgovor.status === 200) {
            console.log("Korisnik ubačen na servisu");
            return true;
        }
        else {
            console.log(odgovor.status);
            console.log(await odgovor.text());
            return false;
        }
    }
    async prijaviKorisnika(korime, lozinka) {
        lozinka = kodovi.kreirajSHA256(lozinka, "moja sol");
        let tijelo = {
            lozinka: lozinka,
        };
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = {
            method: "POST",
            body: JSON.stringify(tijelo),
            headers: zaglavlje,
        };
        let odgovor = await fetch(`${this.baseUrl}/servis/korisnici/${korime}/prijava`, parametri);
        if (odgovor.status === 200) {
            return JSON.parse(await odgovor.text());
        }
        else {
            return false;
        }
    }
    async dajTipKorisnika(korime) {
        const odgovor = await fetch(`${this.baseUrl}/servis/korisnici/${korime}/tip`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (odgovor.status === 200) {
            const podaci = await odgovor.json();
            return podaci.tip_korisnika;
        }
        return null;
    }
}
