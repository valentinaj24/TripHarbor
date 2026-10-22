# Node.js, Express in TypeScript za backend

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Strežnik mora ponuditi REST API, preverjati JWT, izvajati pravila prijav in uporabljati PostgreSQL. Ker frontend uporablja TypeScript, je koristna podobna razvojna izkušnja.

## Obravnavane možnosti

- Node.js + Express + TypeScript
- Python + FastAPI
- Java + Spring Boot

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Node.js + Express + TypeScript.** Odločitev je primerna za TripHarbor, ker enoten jezik na obeh straneh zmanjša preklapljanje med tehnologijami, Express pa omogoča preprosto sestavljanje poti, middleware in storitev brez nepotrebnega ogrodnega obsega.

### Posledice

**Pozitivne:**

- Enoten jezik za frontend in backend; prilagodljiva organizacija REST poti.

**Negativne:**

- Več arhitekturnih pravil je treba določiti samostojno; asinhrone napake in validacijo je treba dosledno obravnavati.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
