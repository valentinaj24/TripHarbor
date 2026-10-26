# Node.js, Express in TypeScript za backend

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Backend bo skrbel za prijavo uporabnikov, ustvarjanje izletov, preverjanje programa, administrativno odobritev in sprejem prijav. Potreben je REST API, ki ga bo mogoče razvijati v okviru projekta.

## Obravnavane možnosti

- Node.js z Expressom.
- Java s Spring Bootom.
- NestJS.

## Sprejeta odločitev in utemeljitev

Za backend so izbrani Node.js, Express in TypeScript. Isti programski jezik na frontendu in backendu poenostavi samostojen razvoj, Express pa omogoča jasno razdelitev REST API-ja na poti, kontrolerje in storitve. Spring Boot in NestJS bi bila prav tako ustrezna, vendar bi za trenutni obseg TripHarbora prinesla dodatno strukturo, ki ni nujna za izvedbo MVP.

## Posledice

**Pozitivne:**

- Isti programski jezik na obeh straneh in dovolj prilagodljiv REST API.

**Negativne:**

- Express sam ne določa strukture projekta, zato je treba posebej poskrbeti za organizacijo modulov, obravnavo napak in varnost.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
