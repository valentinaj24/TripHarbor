# Prisma Migrate za spremembe podatkovne sheme

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Model izletov in prijav je trenutno načrtovan, med implementacijo pa se lahko izkaže, da je treba dodati polje ali spremeniti povezavo. Pomembno je imeti pregled nad spremembami podatkovne sheme in vrstnim redom njihove izvedbe.

## Obravnavane možnosti

- Prisma Migrate.
- Ročno izvajanje SQL skript.
- Ponovna izdelava baze po vsaki spremembi.

## Sprejeta odločitev in utemeljitev

Za upravljanje sprememb podatkovne sheme je izbran Prisma Migrate. Spremembe, na primer dodajanje polja v `trip_activities`, bodo zapisane v migracijah skupaj s kodo, zato bo mogoče slediti razvoju modela in ga ponovno vzpostaviti. Ročno izvajanje nepovezanih SQL skript bi otežilo pregled nad različicami, brisanje in ponovna izdelava baze pa bi lahko povzročila izgubo testnih podatkov.

## Posledice

**Pozitivne:**

- Zgodovina sprememb sheme in ponovljiv zagon baze na drugem računalniku.

**Negativne:**

- Migracije je treba pregledovati in izvajati v pravilnem vrstnem redu, saj lahko nepremišljene spremembe vplivajo na obstoječe podatke.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
