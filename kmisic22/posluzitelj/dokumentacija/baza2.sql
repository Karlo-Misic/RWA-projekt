-- Creator:       MySQL Workbench 8.0.36/ExportSQLite Plugin 0.1.0
-- Author:        Unknown
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2024-11-20 22:30
-- Created:       2024-10-26 15:49

BEGIN;
CREATE TABLE "osobe"(
  "id" INTEGER PRIMARY KEY NOT NULL,
  "ime_i_prezime" VARCHAR(100) NOT NULL,
  "poznat_po" VARCHAR(50) NOT NULL,
  "popularnost" VARCHAR(50) NOT NULL,
  "slika" VARCHAR(50),
  "lik" VARCHAR(50) NOT NULL
);

CREATE TABLE "filmovi"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "originalni_naslov" VARCHAR(100) NOT NULL,
  "naslov" VARCHAR(100) NOT NULL,
  "popularnost" VARCHAR(50) NOT NULL,
  "slika_postera" VARCHAR(50),
  "jezik" VARCHAR(50) NOT NULL,
  "datum_izdavanja" DATE NOT NULL,
  "opis_filma" TEXT
);
CREATE TABLE "slike"(
  "id" INTEGER NOT NULL,
  "slike" VARCHAR(50),
  "osobe_id" INTEGER NOT NULL,
  PRIMARY KEY("id","osobe_id"),
  CONSTRAINT "fk_slike_osobe1"
    FOREIGN KEY("osobe_id")
    REFERENCES "osobe"("id")
);
CREATE INDEX "slike.fk_slike_osobe1_idx" ON "slike" ("osobe_id");
CREATE TABLE "klijent"(
  "korime" VARCHAR(50) PRIMARY KEY NOT NULL,
  CONSTRAINT "korime_UNIQUE"
    UNIQUE("korime")
);
CREATE TABLE "uloga"(
  "id_filmovi" INTEGER NOT NULL,
  "id_osobe" INTEGER NOT NULL,
  "lik" VARCHAR(50) NOT NULL,
  PRIMARY KEY("id_filmovi","id_osobe"),
  CONSTRAINT "fk_Osoba_Film_Film1"
    FOREIGN KEY("id_filmovi")
    REFERENCES "filmovi"("id"),
  CONSTRAINT "fk_Osoba_Film_Osoba1"
    FOREIGN KEY("id_osobe")
    REFERENCES "osobe"("id")
);
CREATE INDEX "uloga.fk_Osoba_Film_Film1_idx" ON "uloga" ("id_filmovi");
CREATE INDEX "uloga.fk_Osoba_Film_Osoba1_idx" ON "uloga" ("id_osobe");

DELETE FROM uloga;
DELETE FROM slike;
DELETE FROM filmovi;
DELETE FROM osobe;
DELETE FROM klijent;

DELETE FROM sqlite_sequence WHERE name = 'osobe';
DELETE FROM sqlite_sequence WHERE name = 'filmovi';
DELETE FROM sqlite_sequence WHERE name = 'slike';

PRAGMA foreign_keys = ON;
COMMIT;