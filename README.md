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

## Lokalni zagon

### Predpogoji

Za lokalni zagon aplikacije potrebujete:

- Node.js in npm
- PostgreSQL
- Git

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/valentinaj24/TripHarbor.git
cd TripHarbor
```

### 2. Nastavitev podatkovne baze

V PostgreSQL ustvarite podatkovno bazo `tripharbor` in uporabnika `tripharbor_user` z ustreznimi pravicami za dostop do podatkovne baze.

Povezava s podatkovno bazo se nastavi v datoteki `backend/.env` s spremenljivko `DATABASE_URL`.

### 3. Namestitev in zagon backenda

V terminalu izvedite:

```bash
cd backend
npm install
```

V direktoriju `backend/` ustvarite datoteko `.env` in nastavite naslednje okoljske spremenljivke:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://tripharbor_user:YOUR_PASSWORD@localhost:5432/tripharbor?schema=public"
JWT_SECRET=replace_with_a_secure_random_secret
```

Vrednost `YOUR_PASSWORD` zamenjajte z geslom uporabnika PostgreSQL, `JWT_SECRET` pa z varno naključno vrednostjo.

Izvedite migracije podatkovne baze in generirajte Prisma Client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Zaženite backend:

```bash
npm run dev
```

Backend je dostopen na naslovu `http://localhost:3000`.

### 4. Namestitev in zagon frontenda

Odprite nov terminal v glavnem direktoriju projekta in izvedite:

```bash
cd frontend
npm install
npm run dev
```

Frontend je dostopen na naslovu `http://localhost:5173`.

Backend in frontend morata med uporabo aplikacije delovati sočasno.

### 5. Administratorski račun

Za ustvarjanje administratorskega računa je na voljo skripta `backend/scripts/create-admin.ts`.

V datoteki `backend/.env` nastavite dodatni okoljski spremenljivki:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-secure-password"
```

Administratorsko geslo mora vsebovati najmanj 12 znakov. Skripta ustvari račun z vlogo `ADMIN` in geslo varno shrani z uporabo bcrypt.

Skripto za ustvarjanje administratorskega računa zaženite po uspešni nastavitvi podatkovne baze in izvedbi migracij.


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
  - `src/components/` – ponovno uporabne komponente uporabniškega vmesnika
  - `src/pages/` – strani aplikacije
  - `src/services/` – komunikacija z zalednim API-jem
- `backend/` – strežniški del aplikacije
  - `src/routes/` – definicije API-poti
  - `prisma/` – podatkovni model in migracije podatkovne baze
  - `scripts/` – pomožne skripte za upravljanje aplikacije
- `docs/` – projektna dokumentacija
  - `adr/` – zapisi arhitekturnih odločitev
