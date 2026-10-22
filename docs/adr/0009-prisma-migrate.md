# Prisma Migrate za spremembe sheme

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Shema TripHarbora se bo med razvojem spreminjala, na primer pri statusih, povezavah in omejitvah. Spremembe morajo biti ponovljive med lokalnimi okolji in shranjene v Git.

## Obravnavane možnosti

- Prisma Migrate
- Ročno izvajanje SQL skript
- Samodejno ustvarjanje sheme brez verzioniranih migracij

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Prisma Migrate.** Odločitev je primerna za TripHarbor, ker vsaka sprememba podatkovnega modela dobi sledljivo migracijo, povezano s Prisma shemo, zato je postavitev baze ponovljiva.

### Posledice

**Pozitivne:**

- Verzionirane spremembe sheme; enostavnejša ponovitev strukture baze.

**Negativne:**

- Migracije je treba pregledovati in pravilno izvajati; nevarne spremembe lahko zahtevajo ročni načrt prenosa podatkov.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
