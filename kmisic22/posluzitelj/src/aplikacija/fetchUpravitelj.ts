import * as jwt from "../zajednicko/jwt.js";
import { Request, Response } from "express";
import { RWASession } from "./htmlUpravitelj.js";
export class FetchUpravitelj {
	private tajniKljucJWT: string;

	constructor(tajniKljucJWT: string) {
		this.tajniKljucJWT = tajniKljucJWT;
	}

	async getJWT(zahtjev: Request, odgovor: Response) {
		odgovor.type("json");
		let sesija = zahtjev.session as RWASession;
		if (sesija["korime"] != null) {
			let k = { korime: sesija.korime };
			let noviToken = jwt.kreirajToken(k, this.tajniKljucJWT);
			odgovor.send({ ok: noviToken });
			return;
		}
		odgovor.status(401);
		odgovor.send({ greska: "nemam token!" });
	}

	provjeriPristup(dozvoljeneUloge: string[]) {
		return (req: Request, res: Response, next: Function) => {
			const sesija = req.session as RWASession;
			const uloga = sesija.uloga || "gost";

			if (!jwt) {
				console.error("JWT nije prihvaćen.");
				res.status(406).send("JWT nije prihvaćen.");
				return;
			}

			if (dozvoljeneUloge.includes(uloga)) {
				return next();
			} else {
				console.warn(`Pristup odbijen za ulogu: ${uloga}`);
				res.status(403).send(`
					<html>
						<body>
							<p>Nemate pristup ovoj stranici.</p>
							<script>
								setTimeout(() => {
									window.location.href = "/prijava";
								}, 500);
							</script>
						</body>
					</html>
				`);
			}
		};
	}
}
