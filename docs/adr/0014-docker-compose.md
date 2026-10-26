# Docker Compose za lokalni PostgreSQL

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Za razvoj bo potrebna lokalna podatkovna baza PostgreSQL s trajnim shranjevanjem. Pomembno je, da je mogoče podatkovno bazo ponovno zagnati brez ročne namestitve in ponovnega nastavljanja vseh parametrov.

## Obravnavane možnosti

- Docker Compose.
- Ročna namestitev PostgreSQL.
- Uporaba izključno oddaljene baze.

## Sprejeta odločitev in utemeljitev

Za lokalni zagon PostgreSQL je izbran Docker Compose. Konfiguracija bo zapisana v `compose.yaml`, podatki pa shranjeni v trajnem volumnu, zato ne bo potrebna ročna namestitev baze ob ponovni vzpostavitvi razvojnega okolja. Oddaljena baza bi zahtevala stalno povezavo, ročna namestitev pa več lokalnih nastavitev. Frontend in backend v tej fazi še ne potrebujeta lastnih vsebnikov.

## Posledice

**Pozitivne:**

- Ponovljiv lokalni zagon baze in ohranjanje podatkov med ponovnimi zagoni vsebnika.

**Negativne:**

- Za lokalni razvoj je potrebna namestitev Dockerja, poleg tega je treba pravilno nastaviti podatkovni volumen in okoljske spremenljivke.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
