import { dajNasumceBroj } from "../zajednicko/kodovi.js";
import { TMDBklijent } from "./klijentTMDB.js";
import * as jwt from "../zajednicko/jwt.js";
export class RestTMDB {
    tmdbKlijent;
    tajniKljucJWT;
    constructor(api_kljuc, tajniKljucJWT) {
        this.tmdbKlijent = new TMDBklijent(api_kljuc);
        this.tajniKljucJWT = tajniKljucJWT;
        console.log(api_kljuc);
    }
    getFilmoviJWT(zahtjev, odgovor) {
        if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
            odgovor.status(401);
            odgovor.json({ greska: "neaoutorizirani pristup" });
        }
        else {
            this.getFilmovi(zahtjev, odgovor);
        }
    }
    async dodajFilm(zahtjev, odgovor) {
        console.log(zahtjev.body);
        if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
            odgovor.status(401);
            odgovor.json({ greska: "neaoutorizirani pristup" });
        }
        else {
            odgovor.json({ ok: "OK" });
        }
    }
    getZanr(zahtjev, odgovor) {
        console.log(this);
        this.tmdbKlijent
            .dohvatiZanrove()
            .then((zanrovi) => {
            odgovor.type("application/json");
            odgovor.json(zanrovi);
        })
            .catch((greska) => {
            odgovor.json(greska);
        });
    }
    getFilmovi(zahtjev, odgovor) {
        console.log(this);
        odgovor.type("application/json");
        let stranica = zahtjev.query["stranica"];
        let trazi = zahtjev.query["trazi"];
        if (stranica == null ||
            trazi == null ||
            typeof stranica != "string" ||
            typeof trazi != "string") {
            odgovor.status(417);
            odgovor.send({ greska: "neocekivani podaci" });
            return;
        }
        this.tmdbKlijent
            .pretraziFilmovePoNazivu(trazi, parseInt(stranica))
            .then((filmovi) => {
            odgovor.send(filmovi);
        })
            .catch((greska) => {
            odgovor.json(greska);
        });
    }
    async dohvatiNasumceFilm(zahtjev, odgovor) {
        let zanr = zahtjev.query["zanr"] ?? "";
        if (typeof zanr == "string") {
            this.tmdbKlijent
                .pretraziFilmovePoNazivu(zanr, 1)
                .then((filmovi) => {
                let rez = [
                    filmovi.results[dajNasumceBroj(0, 20)],
                    filmovi.results[dajNasumceBroj(0, 20)],
                ];
                odgovor.json(rez);
            })
                .catch((greska) => {
                odgovor.json(greska);
            });
        }
        else {
            odgovor.json({ greska: "fali žanr" });
        }
    }
}
