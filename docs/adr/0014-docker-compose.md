# Docker Compose za lokalno razvojno okolje

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Projekt uporablja PostgreSQL in Node.js aplikacijo, zato je pomembno, da je razvojno okolje ponovljivo in ne odvisno od ročne namestitve vseh storitev na računalnik.

## Obravnavane možnosti

- Docker Compose
- Ročna namestitev PostgreSQL in Node.js
- Polno orkestracijsko okolje Kubernetes

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Docker Compose.** Odločitev je primerna za TripHarbor, ker z eno konfiguracijo omogoča zagon potrebnih lokalnih storitev, predvsem PostgreSQL, brez nepotrebne zahtevnosti Kubernetes za samostojen MVP.

### Posledice

**Pozitivne:**

- Ponovljiv lokalni zagon in dokumentirana konfiguracija storitev; lažja priprava razvojnega okolja.

**Negativne:**

- Potrebna je namestitev Dockerja; konfiguracijo okolja in trajne podatkovne volumne je treba pravilno urediti.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
