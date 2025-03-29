import { KorisnikDAO } from "./korisnikDAO.js";
export class RestKorisnik {
    kdao;
    constructor() {
        this.kdao = new KorisnikDAO();
    }
    getKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405).send({ greska: "Zabranjena metoda" });
    }
    async getKorisnike(zahtjev, odgovor) {
        odgovor.type("application/json");
        try {
            const korisnici = await this.kdao.dajSve();
            odgovor.status(200).send(JSON.stringify(korisnici));
        }
        catch (error) {
            const err = error;
            odgovor.status(500).send(JSON.stringify({
                greska: "Pogreška pri dohvaćanju korisnika",
                detalji: err.message,
            }));
        }
    }
    postKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        let podaci = zahtjev.body;
        let poruka = this.kdao.dodaj(podaci);
        odgovor.send(JSON.stringify(poruka));
    }
    deleteKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405).send({ greska: "Zabranjena metoda" });
    }
    putKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405).send({ greska: "Zabranjena metoda" });
    }
    /*
    getKorisnik(zahtjev: Request, odgovor: Response) {
        odgovor.type("application/json");
        let korime = zahtjev.params["korime"];
        if (korime == undefined) {
            odgovor.send({ greska: "Nepostojeće korime" });
            return;
        }
        this.kdao.daj(korime).then((korisnik) => {
            console.log(korisnik);
            odgovor.send(JSON.stringify(korisnik));
        });
    }
*/
    getKorisnikPrijava(zahtjev, odgovor) {
        odgovor.type("application/json");
        let korime = zahtjev.params["korime"];
        if (korime == undefined) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({ greska: "Krivi podaci!" }));
            return;
        }
        this.kdao.daj(korime).then((korisnik) => {
            console.log(korisnik);
            if (korisnik != null && korisnik.lozinka == zahtjev.body.lozinka) {
                korisnik.lozinka = null;
                odgovor.send(JSON.stringify(korisnik));
            }
            else {
                odgovor.status(401);
                odgovor.send(JSON.stringify({ greska: "Krivi podaci!" }));
            }
        });
    }
    postKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        let poruka = { greska: "zabranjena metoda" };
        odgovor.send(JSON.stringify(poruka));
    }
    deleteKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        if (zahtjev.params["korime"] != undefined) {
            this.kdao.obrisi(zahtjev.params["korime"]);
            let poruka = { ok: "obrisan" };
            odgovor.send(JSON.stringify(poruka));
            return;
        }
        odgovor.status(407);
        let poruka = { greska: "Nedostaje podatak" };
        odgovor.send(JSON.stringify(poruka));
    }
    putKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405).send({ greska: "Zabranjena metoda" });
    }
}
