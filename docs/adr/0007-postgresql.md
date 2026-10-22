# PostgreSQL kot relacijska podatkovna baza

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Podatkovni model povezuje users, destinations, trips, trip_activities in registrations. Sistem mora preprečiti podvojene prijave in preseganje kapacitet tudi pri sočasnih zahtevkih.

## Obravnavane možnosti

- PostgreSQL
- MongoDB
- SQLite

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: PostgreSQL.** Odločitev je primerna za TripHarbor, ker relacije, tuji ključi, enolične omejitve in transakcije ustrezajo petim povezanim entitetam; zlasti potrditev prijave zahteva doslednost pri sočasnem dostopu.

### Posledice

**Pozitivne:**

- Referenčna integriteta in transakcije; enolična omejitev prijave na izlet.

**Negativne:**

- Potrebna je ločena baza in njeno upravljanje; pravilna transakcijska zaščita pred tekmovalnimi pogoji ostaja odgovornost aplikacije.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
