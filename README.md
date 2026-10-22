# TripHarbor

TripHarbor je spletna aplikacija za odkrivanje, načrtovanje in organizacijo skupinskih izletov. Udeležencem omogoča iskanje izletov, pregled podrobnosti in prijavo na izlete. Organizatorji lahko pripravljajo programe aktivnosti in upravljajo prijave, administratorji pa odobravajo objave izletov.

## Uporabljene tehnologije

- **Frontend:** React, TypeScript, Tailwind CSS, React Router, Vite
- **Backend:** Node.js, Express, TypeScript
- **Podatkovna baza:** PostgreSQL
- **ORM:** Prisma ORM, Prisma Migrate
- **Avtentikacija:** JWT, bcrypt
- **Validacija podatkov:** Zod
- **Zemljevid:** MapLibre GL JS, OpenFreeMap, Nominatim
- **Razvojna orodja:** Docker Compose, Git, GitHub

## Dokumentacija

Projektna dokumentacija je shranjena v direktoriju [`docs/`](docs/).

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframes](docs/06-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)

## Struktura projekta

- `frontend/` – odjemalski del aplikacije
- `backend/` – strežniški del aplikacije
- `docs/` – projektna dokumentacija


