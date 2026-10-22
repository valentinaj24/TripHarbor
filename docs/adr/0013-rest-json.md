# REST API in JSON za komunikacijo

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Frontend mora pridobivati in spreminjati izlete, aktivnosti ter prijave, backend pa mora zagotavljati jasne poti in statusne kode. V MVP ni potrebe po kompleksnem poizvedovalnem jeziku.

## Obravnavane možnosti

- REST API z JSON
- GraphQL
- Neposredna povezava frontenda z bazo

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: REST API z JSON.** Odločitev je primerna za TripHarbor, ker vire, kot so trips in registrations, naravno predstavimo z HTTP metodami in JSON podatki; API lahko preizkusimo neodvisno od uporabniškega vmesnika.

### Posledice

**Pozitivne:**

- Razumljive poti in standardni HTTP statusi; preprosto testiranje.

**Negativne:**

- Pri kompleksnih zaslonih je včasih potrebnih več zahtevkov; spremembe API pogodbe zahtevajo uskladitev frontenda.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
