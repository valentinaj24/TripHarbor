# Prisma ORM za dostop do podatkov

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Backend bo pogosto povezoval izlete z destinacijami, organizatorji, aktivnostmi in prijavami. Ker je predviden TypeScript, je pomembno pri pisanju poizvedb dobiti pomoč pri preverjanju tipov.

## Obravnavane možnosti

- Prisma ORM.
- Neposredne SQL-poizvedbe s knjižnico pg.
- TypeORM.

## Sprejeta odločitev in utemeljitev

Za dostop do PostgreSQL je izbran Prisma ORM. Relacije med izleti, organizatorji, destinacijami, aktivnostmi in prijavami bodo opisane v shemi, TypeScript pa bo omogočal tipizirano delo s poizvedbami. To je uporabno zlasti pri pridobivanju podrobnosti izleta skupaj s programom in organizatorjem. Neposredni SQL ostaja možnost za zahtevnejše primere, vendar ni izbran za večino običajnih poizvedb.

## Posledice

**Pozitivne:**

- Manj ponavljajoče se kode za običajne poizvedbe; tipi pomagajo pri delu z relacijami.

**Negativne:**

- Za zahtevnejše poizvedbe ali transakcijsko zaščito bo morda potreben dodaten SQL; Prisma doda lastno orodje in način dela.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
