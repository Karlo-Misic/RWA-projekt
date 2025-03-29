**Koraci za pokretanje:**

LINUX

1. Otvoriti folder u VS Codeu.  
2. Pozicionirati se u folder `posluzitelj` (u terminal upisati `cd posluzitelj`)
3. Upisati u terminal `mkdir "$env:APPDATA\npm"`
4. Upisati u terminal `npm install`  
5. Upisati u terminal: `npm run pripremi`  
6. Zatim upisati: `npm run start`  
7. Server je pokrenut na portu: **12222**  
   - U browser upisati: [http://localhost:12222/prijava](http://localhost:12222/prijava)
  
**Koraci za pokretanje:**

WINDOWS

1. Otvoriti folder u VS Codeu.  
2. Pozicionirati se u folder `posluzitelj` (u terminal upisati `cd posluzitelj`)
3. Upisati u terminal `mkdir "$env:APPDATA\npm"`
4. Upisati u terminal `npm install`
5. Upisati u terminal `npm install --save-dev rimraf`
6. Otvoriti package.json fajl i zamjeniti `"clean": "rm -r build/*",` sa `"clean": "rimraf build/*",`
7. Upisati u terminal `npm install --save-dev typescript`
8. Upisati u terminal `npm install express express-session cookie-parser better-sqlite3 cors jsonwebtoken nodemailer base32-encoding totp-generator`
9. Upisati u terminal `npm install --save-dev @types/express @types/express-session @types/cookie-parser @types/cors @types/jsonwebtoken @types/nodemailer`
10. Upisati u terminal `npm install --save-dev copyfiles`
11. Upisati u terminal: `npm run pripremi`  
12. Zatim upisati: `npm run start`  
13. Server je pokrenut na portu: **12222**  
   - U browser upisati: [http://localhost:12222/prijava](http://localhost:12222/prijava)
