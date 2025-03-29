import * as jwt from "../zajednicko/jwt.js";
export class FetchUpravitelj {
    tajniKljucJWT;
    constructor(tajniKljucJWT) {
        this.tajniKljucJWT = tajniKljucJWT;
    }
    async getJWT(zahtjev, odgovor) {
        odgovor.type("json");
        let sesija = zahtjev.session;
        if (sesija["korime"] != null) {
            let k = { korime: sesija.korime };
            let noviToken = jwt.kreirajToken(k, this.tajniKljucJWT);
            odgovor.send({ ok: noviToken });
            return;
        }
        odgovor.status(401);
        odgovor.send({ greska: "nemam token!" });
    }
    provjeriPristup(dozvoljeneUloge) {
        return (req, res, next) => {
            const sesija = req.session;
            const uloga = sesija.uloga || "gost";
            if (!jwt) {
                console.error("JWT nije prihvaćen.");
                res.status(406).send("JWT nije prihvaćen.");
                return;
            }
            if (dozvoljeneUloge.includes(uloga)) {
                return next();
            }
            else {
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
