# REST API in JSON za komunikacijo

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

React in Express bosta ločeni aplikaciji. Frontend mora pridobiti objavljene izlete, poslati prijavo, preveriti program in prikazati status zahtev.

## Obravnavane možnosti

- REST API z JSON.
- GraphQL.
- Strežniško izrisovanje brez ločenega API-ja.

## Sprejeta odločitev in utemeljitev

Za komunikacijo med React frontendom in Express backendom je izbran REST API z odgovori v obliki JSON. Funkcionalnosti TripHarbora imajo jasne vire, kot so `trips` in `registrations`, ter operacije za pregled, ustvarjanje in spremembo statusa. Končne točke bo mogoče preverjati s Postmanom še pred izdelavo vseh strani. GraphQL bi omogočil prilagodljive poizvedbe, vendar bi za predvideni obseg prinesel dodatno zahtevnost.

## Posledice

**Pozitivne:**

- Pregledne končne točke in preprosto testiranje neodvisno od frontenda.

**Negativne:**

- Treba je vzdrževati dogovor o obliki odgovorov in napak; za nekatere poglede bo morda potrebnih več zahtev.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
