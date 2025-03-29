-- Creator:       MySQL Workbench 8.0.36/ExportSQLite Plugin 0.1.0
-- Author:        Unknown
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2024-11-19 22:26
-- Created:       2024-11-18 14:18

BEGIN;
CREATE TABLE "tip_korisnika"(
  "id" INTEGER PRIMARY KEY NOT NULL,
  "naziv" VARCHAR(45) NOT NULL,
  "opis" TEXT
);
CREATE TABLE "korisnik"(
  "id" INTEGER PRIMARY KEY NOT NULL,
  "ime" VARCHAR(50),
  "prezime" VARCHAR(100),
  "adresa" TEXT,
  "korime" VARCHAR(50) NOT NULL,
  "lozinka" VARCHAR(1000) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "tip_korisnika_id" INTEGER NOT NULL,
  "brojMobitela" VARCHAR(10),
  "spol" VARCHAR(6),
  "pristup" INTEGER NOT NULL,
  "zahtjevZaPristup" VARCHAR(45) NOT NULL,
  CONSTRAINT "fk_korisnik_tip_korisnika"
    FOREIGN KEY("tip_korisnika_id")
    REFERENCES "tip_korisnika"("id")
);
CREATE INDEX "korisnik.fk_korisnik_tip_korisnika_idx" ON "korisnik" ("tip_korisnika_id");
COMMIT;

INSERT INTO tip_korisnika(naziv,opis)  VALUES("admin","administrator");

INSERT INTO tip_korisnika(naziv,opis)  VALUES("moderator","moderator");

INSERT INTO tip_korisnika(naziv,opis)  VALUES("obican","obican korisnik");