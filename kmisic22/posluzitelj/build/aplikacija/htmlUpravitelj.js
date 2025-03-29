import { __dirname } from "../zajednicko/esmPomocnik.js";
import ds from "fs/promises";
import { ServisKlijent } from "./servsiKlijent.js";
import path from "path";
export class HtmlUpravitelj {
    tajniKljucJWT;
    servisKlijent;
    portRest;
    constructor(tajniKljucJWT, portRest) {
        this.tajniKljucJWT = tajniKljucJWT;
        console.log(this.tajniKljucJWT);
        this.servisKlijent = new ServisKlijent(portRest);
        this.portRest = portRest;
    }
    async dokumentacija(req, res) {
        try {
            const dokumentacijaStranica = await this.ucitajDokumentaciju(req, res);
            res.cookie("portRest", this.portRest, { httpOnly: false });
            res.send(dokumentacijaStranica);
        }
        catch (error) {
            console.error("Greška pri slanju dokumentacije:", error);
            res.status(500).send("<h1>Greška pri slanju dokumentacije</h1>");
        }
    }
    async dodavanjeOsoba(req, res) {
        try {
            const stranica = await this.ucitajDodavanjeOsobe(req, res);
            res.cookie("portRest", this.portRest, { httpOnly: false });
            res.send(stranica);
        }
        catch (error) {
            console.error("Greška pri učitavanju stranice za dodavanje osoba:", error);
            res
                .status(500)
                .send("<h1>Greška pri učitavanju stranice za dodavanje osoba</h1>");
        }
    }
    async osobe(req, res) {
        try {
            const stranica = await this.ucitajOsobe("osobe", req, res);
            res.cookie("portRest", this.portRest, { httpOnly: false });
            res.send(stranica);
        }
        catch (error) {
            console.error("Greška pri učitavanju stranice za osobe:", error);
            res.status(500).send("<h1>Greška pri učitavanju stranice za osobe</h1>");
        }
    }
    async detalji(req, res) {
        try {
            const stranica = await this.ucitajDetalji("detalji", req, res);
            res.cookie("portRest", this.portRest, { httpOnly: false });
            res.send(stranica);
        }
        catch (error) {
            console.error("Greška pri učitavanju stranice za detalje:", error);
            res
                .status(500)
                .send("<h1>Greška pri učitavanju stranice za detalje</h1>");
        }
    }
    async registracija(zahtjev, odgovor) {
        console.log(zahtjev.body);
        let greska = "";
        if (zahtjev.method == "POST") {
            let uspjeh = await this.servisKlijent.dodajKorisnika(zahtjev.body);
            if (uspjeh) {
                odgovor.redirect("/prijava");
                return;
            }
            else {
                greska = "Dodavanje nije uspjelo provjerite podatke!";
            }
        }
        const stranica = await this.ucitajStranicu("registracija", greska, zahtjev);
        odgovor.send(stranica);
    }
    async odjava(zahtjev, odgovor) {
        let sesija = zahtjev.session;
        sesija.korisnik = null;
        sesija.uloga = "gost";
        zahtjev.session.destroy((err) => {
            //console.log("Sesija uništena! Error (ako ima je):" + err);
        });
        odgovor.redirect("/");
    }
    prijava = async (req, res) => {
        const sesija = req.session;
        if (sesija && sesija.korime) {
            console.log(`Korisnik ${sesija.korime} već ima aktivnu sesiju. Preusmjeravanje na /profil.`);
            res.redirect("/profil");
            return;
        }
        let greska = "";
        if (req.method === "POST") {
            const { korime, lozinka, captchaToken } = req.body;
            if (!captchaToken) {
                greska = "reCAPTCHA token nije dostavljen.";
                const stranica = await this.ucitajStranicu("prijava", greska, req);
                res.send(stranica);
                return;
            }
            try {
                const recaptchaResponse = await fetch(`https://recaptchaenterprise.googleapis.com/v1/projects/rwakmisic22-1736185312315/assessments?key=6Lfc268qAAAAAEfFooq6pSI4k_Xn8aDILGoCUkxB`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event: {
                            token: captchaToken,
                            expectedAction: "LOGIN",
                            siteKey: "6Lfc268qAAAAAEfFooq6pSI4k_Xn8aDILGoCUkxB",
                        },
                    }),
                });
                const recaptchaData = await recaptchaResponse.json();
                if (!recaptchaData.tokenProperties ||
                    !recaptchaData.tokenProperties.valid) {
                    console.error("Invalid reCAPTCHA token properties:", recaptchaData.tokenProperties);
                    greska = `Neuspješna reCAPTCHA verifikacija. Razlog: ${recaptchaData.tokenProperties.invalidReason || "Nepoznato"}`;
                    const stranica = await this.ucitajStranicu("prijava", greska, req);
                    res.send(stranica);
                    return;
                }
            }
            catch (error) {
                console.error("Greška pri provjeri reCAPTCHA:", error);
                greska = "Greška pri reCAPTCHA verifikaciji. Pokušajte ponovo.";
                const stranica = await this.ucitajStranicu("prijava", greska, req);
                res.send(stranica);
                return;
            }
            const korisnik = await this.servisKlijent.prijaviKorisnika(korime, lozinka);
            if (korisnik) {
                const tipKorisnika = await this.servisKlijent.dajTipKorisnika(korime);
                if (tipKorisnika !== null) {
                    sesija.korisnik = `${korisnik.ime} ${korisnik.prezime}`;
                    sesija.korime = korisnik.korime;
                    res.cookie("korime", korisnik.korime, {
                        httpOnly: false,
                        maxAge: 1000 * 60 * 60 * 3,
                    });
                    switch (tipKorisnika) {
                        case 1:
                            sesija.uloga = "admin";
                            res.cookie("uloga", "admin", {
                                httpOnly: false,
                                maxAge: 1000 * 60 * 60 * 3,
                            });
                            break;
                        case 2:
                            sesija.uloga = "moderator";
                            break;
                        case 3:
                            sesija.uloga = "obican";
                            break;
                        default:
                            sesija.uloga = "gost";
                    }
                    res.redirect("/profil");
                    return;
                }
                else {
                    greska = "Tip korisnika nije pronađen!";
                }
            }
            else {
                greska = "Netocni podaci!";
            }
        }
        const stranica = await this.ucitajStranicu("prijava", greska, req);
        res.send(stranica);
    };
    async adminStranica(req, res) {
        try {
            const stranice = [
                this.ucitajHTML("admin"),
                this.ucitajHTML("navigacija"),
            ];
            let [adminStranica, nav] = await Promise.all(stranice);
            if (adminStranica && nav) {
                const sesija = req.session || {};
                let odjavaLink = '<a href="/odjava" style="display: none;">Odjava</a>';
                let prijavaStyle = "";
                let registracijaStyle = "";
                if (sesija.uloga && sesija.uloga !== "gost") {
                    odjavaLink = `<a href="/odjava">Odjava (${sesija.korime || "Korisnik"})</a>`;
                    prijavaStyle = 'style="display: none;"';
                    registracijaStyle = 'style="display: none;"';
                }
                nav = nav
                    .replace('<a href="/prijava">Prijava</a>', `<a href="/prijava" ${prijavaStyle}>Prijava</a>`)
                    .replace('<a href="/registracija">Registracija</a>', `<a href="/registracija" ${registracijaStyle}>Registracija</a>`)
                    .replace("#odjavaLink#", odjavaLink);
                adminStranica = adminStranica.replace("#navigacija#", nav);
                res.send(adminStranica);
            }
            else {
                res.status(500).send("Greška pri učitavanju admin stranice.");
            }
        }
        catch (error) {
            res.status(500).send("Greška pri učitavanju admin stranice.");
        }
    }
    async filmoviPretrazivanje(zahtjev, odgovor) {
        const stranica = await this.ucitajStranicu("filmovi_pretrazivanje", "", zahtjev);
        odgovor.send(stranica);
    }
    async ucitajStranicu(nazivStranice, poruka = "", zahtjev) {
        let stranice = [
            this.ucitajHTML(nazivStranice),
            this.ucitajHTMLNavigacija(zahtjev?.session),
        ];
        let [stranica, nav] = await Promise.all(stranice);
        if (stranica != undefined && nav != undefined) {
            let odjavaLink = "";
            if (zahtjev) {
                const sesija = zahtjev.session || {};
                if (sesija.uloga && sesija.uloga !== "gost") {
                    odjavaLink = `<a href="/odjava">Odjava (${sesija.korime || "Korisnik"})</a>`;
                }
            }
            nav = nav.replace("#odjavaLink#", odjavaLink);
            stranica = stranica.replace("#navigacija#", nav);
            stranica = stranica.replace("#poruka#", poruka);
            return stranica;
        }
        return "";
    }
    async ucitajHTMLNavigacija(sesija) {
        let navigacija = await this.ucitajHTML("navigacija");
        if (sesija && sesija.korime) {
            navigacija = navigacija.replace('<a href="/prijava">Prijava</a>', "");
            navigacija = navigacija.replace('<a href="/registracija">Registracija</a>', "");
        }
        return navigacija.replace("#odjavaLink#", sesija?.korime ? `<a href="/odjava">Odjava (${sesija.korime})</a>` : "");
    }
    ucitajHTML(htmlStranica) {
        return ds.readFile(__dirname() + "/html/" + htmlStranica + ".html", "utf-8");
    }
    async ucitajDokumentaciju(req, res) {
        try {
            const stranice = [
                ds.readFile(path.join(__dirname(), "../../dokumentacija", "dokumentacija.html"), "utf-8"),
                this.ucitajHTML("navigacija"),
            ];
            let [dokumentacijaStranica, nav] = await Promise.all(stranice);
            if (!dokumentacijaStranica || !nav) {
                return "<h1>Greška pri učitavanju dokumentacije</h1>";
            }
            const sesija = req.session || {};
            const uloga = sesija.uloga || "gost";
            const korime = sesija.korime;
            const baseUrl = req.hostname === "spider.foi.hr"
                ? `http://spider.foi.hr:12203`
                : `http://localhost:12222`;
            if (uloga === "gost") {
                const navLinks = nav.match(/<a href="[^"]+">[^<]+<\/a>(?!\s*--)/g) || [];
                nav = navLinks.filter((link) => !link.includes("/odjava")).join("");
                nav = `<nav>${nav}</nav>`;
            }
            else {
                const korisnikPodaci = await fetch(`${baseUrl}/servis/korisnici/${korime}`)
                    .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Greška pri dohvaćanju podataka: ${response.status}`);
                    }
                    return response.json();
                })
                    .catch(() => null);
                if (korisnikPodaci?.zahtjevZaPristup === "pending") {
                    const navLinks = nav.match(/<a href="[^"]+">[^<]+<\/a>/g) || [];
                    const dozvoljeniLinkovi = ["dokumentacija", "profil", "odjava"];
                    nav = navLinks
                        .filter((link) => dozvoljeniLinkovi.some((dozvoljeni) => link.includes(dozvoljeni)))
                        .map((link) => link.trim())
                        .join("");
                    nav = `<nav style="justify-content: unset;">${nav}<a href="/odjava">Odjava (${korime})</a></nav>`;
                }
                else {
                    const navLinks = nav.match(/<a href="[^"]+">[^<]+<\/a>/g) || [];
                    nav = navLinks
                        .filter((link) => !link.includes("/prijava") &&
                        !link.includes("/registracija") &&
                        !link.includes("/filmoviPretrazivanje") &&
                        !link.includes("/Početna"))
                        .join("");
                    nav += `<a href="/odjava">Odjava (${korime})</a>`;
                    nav = `<nav>${nav}</nav>`;
                }
            }
            dokumentacijaStranica = dokumentacijaStranica.replace("#navigacija#", nav);
            return dokumentacijaStranica;
        }
        catch (error) {
            return "<h1>Greška pri učitavanju dokumentacije</h1>";
        }
    }
    async ucitajDodavanjeOsobe(req, res) {
        try {
            const stranice = [
                ds.readFile(path.join(__dirname(), "./html", "dodavanjeOsoba.html"), "utf-8"),
                this.ucitajHTML("navigacija"),
            ];
            let [stranica, nav] = await Promise.all(stranice);
            if (stranica && nav) {
                const sesija = req.session || {};
                let odjavaLink = '<a href="/odjava" style="display: none;">Odjava</a>';
                let prijavaStyle = "";
                let registracijaStyle = "";
                if (sesija.uloga && sesija.uloga !== "gost") {
                    odjavaLink = `<a href="/odjava">Odjava (${sesija.korime || "Korisnik"})</a>`;
                    prijavaStyle = 'style="display: none;"';
                    registracijaStyle = 'style="display: none;"';
                }
                nav = nav
                    .replace('<a href="/prijava">Prijava</a>', `<a href="/prijava" ${prijavaStyle}>Prijava</a>`)
                    .replace('<a href="/registracija">Registracija</a>', `<a href="/registracija" ${registracijaStyle}>Registracija</a>`)
                    .replace("#odjavaLink#", odjavaLink);
                stranica = stranica.replace("#navigacija#", nav);
                return stranica;
            }
            else {
                return "<h1>Greška pri učitavanju stranice</h1>";
            }
        }
        catch (error) {
            return "<h1>Greška pri učitavanju stranice</h1>";
        }
    }
    async ucitajOsobe(p0, req, res) {
        try {
            const stranice = [
                ds.readFile(path.join(__dirname(), "./html", "osobe.html"), "utf-8"),
                this.ucitajHTML("navigacija"),
            ];
            let [stranica, nav] = await Promise.all(stranice);
            if (stranica && nav) {
                const sesija = req.session || {};
                let odjavaLink = '<a href="/odjava" style="display: none;">Odjava</a>';
                let prijavaStyle = "";
                let registracijaStyle = "";
                if (sesija.uloga && sesija.uloga !== "gost") {
                    odjavaLink = `<a href="/odjava">Odjava (${sesija.korime || "Korisnik"})</a>`;
                    prijavaStyle = 'style="display: none;"';
                    registracijaStyle = 'style="display: none;"';
                }
                nav = nav
                    .replace('<a href="/prijava">Prijava</a>', `<a href="/prijava" ${prijavaStyle}>Prijava</a>`)
                    .replace('<a href="/registracija">Registracija</a>', `<a href="/registracija" ${registracijaStyle}>Registracija</a>`)
                    .replace("#odjavaLink#", odjavaLink);
                stranica = stranica.replace("#navigacija#", nav);
                return stranica;
            }
            else {
                return "<h1>Greška pri učitavanju stranice</h1>";
            }
        }
        catch (error) {
            return "<h1>Greška pri učitavanju stranice</h1>";
        }
    }
    async ucitajDetalji(p0, req, res) {
        try {
            const stranice = [
                ds.readFile(path.join(__dirname(), "./html", "detalji.html"), "utf-8"),
                this.ucitajHTML("navigacija"),
            ];
            let [stranica, nav] = await Promise.all(stranice);
            if (stranica && nav) {
                const sesija = req.session || {};
                let odjavaLink = '<a href="/odjava" style="display: none;">Odjava</a>';
                let prijavaStyle = "";
                let registracijaStyle = "";
                if (sesija.uloga && sesija.uloga !== "gost") {
                    odjavaLink = `<a href="/odjava">Odjava (${sesija.korime || "Korisnik"})</a>`;
                    prijavaStyle = 'style="display: none;"';
                    registracijaStyle = 'style="display: none;"';
                }
                nav = nav
                    .replace('<a href="/prijava">Prijava</a>', `<a href="/prijava" ${prijavaStyle}>Prijava</a>`)
                    .replace('<a href="/registracija">Registracija</a>', `<a href="/registracija" ${registracijaStyle}>Registracija</a>`)
                    .replace("#odjavaLink#", odjavaLink);
                stranica = stranica.replace("#navigacija#", nav);
                return stranica;
            }
            else {
                return "<h1>Greška pri učitavanju stranice</h1>";
            }
        }
        catch (error) {
            return "<h1>Greška pri učitavanju stranice</h1>";
        }
    }
    async pocetna(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!sesija.uloga || sesija.uloga === "gost") {
            odgovor.redirect("/prijava");
            return;
        }
        const pocetna = await this.ucitajStranicu("pocetna", "", zahtjev);
        odgovor.cookie("portRest", this.portRest, { httpOnly: false });
        odgovor.send(pocetna);
    }
    async profil(zahtjev, odgovor) {
        const sesija = zahtjev.session;
        if (!sesija.korime) {
            odgovor.redirect("/prijava");
            return;
        }
        const stranica = await this.ucitajStranicu("profil", "", zahtjev);
        odgovor.send(stranica);
    }
}
