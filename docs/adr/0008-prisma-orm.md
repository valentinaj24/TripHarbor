# Prisma ORM za dostop do podatkov

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Backend mora pogosto povezovati izlete, destinacije, aktivnosti, uporabnike in prijave. Ročno pisanje vseh SQL poizvedb bi povečalo možnost neskladij med podatkovnim modelom in TypeScript kodo.

## Obravnavane možnosti

- Prisma ORM
- Neposredni SQL prek pg
- Sequelize ORM

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Prisma ORM.** Odločitev je primerna za TripHarbor, ker iz sheme ustvarja tipiziran odjemalec za relacije in poizvedbe, kar olajša delo s petimi entitetami; za kritično potrjevanje kapacitet je še vedno mogoče uporabiti ustrezne transakcije.

### Posledice

**Pozitivne:**

- Tipizirane poizvedbe in pregledne relacije; manj ročnega preslikavanja podatkov.

**Negativne:**

- Dodatna odvisnost in potreba po učenju Prisma API-ja; zahtevnejše poizvedbe lahko zahtevajo posebno obravnavo.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
