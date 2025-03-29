import express from "express";
import sesija from "express-session";
import kolacici from "cookie-parser";
import { __dirname, dajPort, dajPortSevis } from "../zajednicko/esmPomocnik.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { HtmlUpravitelj } from "./htmlUpravitelj.js";
import { FetchUpravitelj } from "./fetchUpravitelj.js";
import path from "path";
import cors from "cors";

const server = express();
let konf = new Konfiguracija();
let port = dajPort("kmisic22");
if (process.argv[4] != undefined) {
	port = process.argv[4];
}
console.log(port);

let portRest = dajPortSevis("kmisic22");
if (process.argv[3] != undefined) {
	portRest = process.argv[3];
}
console.log(portRest);

konf
	.ucitajKonfiguraciju()
	.then(pokreniServer)
	.catch((greska: Error | any) => {
		if (process.argv.length == 2)
			console.error("Potrebno je dati naziv datoteke");
		else if (greska.path != undefined)
			console.error("Nije moguće otvoriti datoteku: " + greska.path);
		else console.log(greska.message);
		process.exit();
	});

function pokreniServer() {
	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());
	server.use(kolacici());
	server.use(
		sesija({
			secret: konf.dajKonf().tajniKljucSesija,
			saveUninitialized: false,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
		})
	);

	server.use(
		cors({
			origin: "http://localhost:12222",
			methods: ["GET", "POST", "DELETE"],
			credentials: true,
		})
	);

	server.use("/js", express.static(__dirname() + "/jsk"));
	server.use("/css", express.static(__dirname() + "/css"));
	pripremiPutanjePocetna();
	pripremiPutanjeAutentifikacija();
	pripremiPutanjePretrazivanjeFilmova();
	pripremiPutanjeZaDohvatJWT();
	pripremiPutanjeDokumentacija();
	pripremiPutanjeAdmin();
	pripremiPutanjeOsobe();
	pripremiPutanjeDetalji();
	pripremiPutanjeDodavanjeOsoba();

	server.use(
		"/dokumentacija",
		express.static(path.join(__dirname(), "../../dokumentacija"))
	);

	server.use((zahtjev, odgovor) => {
		odgovor.status(404);
		var poruka =
			"<!DOCTYPE html><html lang=hr><head><title>ERROR</title><meta charset=UTF-8><head><body><h1>Stranica nije pronađena!</h1></body></html>";
		odgovor.send(poruka);
	});

	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});
}

function pripremiPutanjePocetna() {
	let htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);
	server.get("/", htmlUpravitelj.pocetna.bind(htmlUpravitelj));
}

function pripremiPutanjePretrazivanjeFilmova() {
	let htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);
	server.get(
		"/filmoviPretrazivanje",
		htmlUpravitelj.filmoviPretrazivanje.bind(htmlUpravitelj)
	);
}

function pripremiPutanjeAutentifikacija() {
	let htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);

	console.log("Postavljam putanje za autentifikaciju...");

	server.get("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
	server.post(
		"/registracija",
		htmlUpravitelj.registracija.bind(htmlUpravitelj)
	);
	server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
	server.get("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
	server.post("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
}

function pripremiPutanjeZaDohvatJWT() {
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	server.get("/getJWT", fetchUpravitelj.getJWT.bind(fetchUpravitelj));
}

function pripremiPutanjeDokumentacija() {
	let htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);
	server.get(
		"/dokumentacija",
		htmlUpravitelj.dokumentacija.bind(htmlUpravitelj)
	);
	server.get("/profil", htmlUpravitelj.profil.bind(htmlUpravitelj));
}

function pripremiPutanjeDodavanjeOsoba() {
	const fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	const htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);
	server.get(
		"/dodavanjeOsoba",
		fetchUpravitelj.provjeriPristup(["admin", "moderator", "obican"]),
		htmlUpravitelj.dodavanjeOsoba.bind(htmlUpravitelj)
	);
}

function pripremiPutanjeOsobe() {
	const fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	const htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);
	server.get(
		"/osobe",
		fetchUpravitelj.provjeriPristup(["admin", "moderator", "obican"]),
		htmlUpravitelj.osobe.bind(htmlUpravitelj)
	);
}

function pripremiPutanjeDetalji() {
	const fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	const htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);

	server.get(
		"/detalji",
		fetchUpravitelj.provjeriPristup(["admin", "moderator", "obican"]),
		htmlUpravitelj.detalji.bind(htmlUpravitelj)
	);
}

function pripremiPutanjeAdmin() {
	const fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	const htmlUpravitelj = new HtmlUpravitelj(
		konf.dajKonf().jwtTajniKljuc,
		portRest
	);

	server.get(
		"/admin",
		fetchUpravitelj.provjeriPristup(["admin"]),
		htmlUpravitelj.adminStranica.bind(htmlUpravitelj)
	);
}
