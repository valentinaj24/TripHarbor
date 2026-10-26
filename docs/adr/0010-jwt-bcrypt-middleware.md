# JWT, bcrypt in middleware za dostop

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

TripHarbor ima tri vloge. Udeleženec ne sme odobriti objave, organizator pa sme urejati samo svoje izlete. Gesla ne smejo biti shranjena kot navadno besedilo.

## Obravnavane možnosti

- JWT z bcrypt in Express middleware.
- Strežniške seje s piškotki.
- Preverjanje pravic samo na frontendu.

## Sprejeta odločitev in utemeljitev

Za avtentikacijo bodo uporabljeni kratkoživi JWT, za zgoščevanje gesel bcrypt, za preverjanje dostopa pa Express middleware. Backend bo pri zaščitenih zahtevah preverjal veljavnost žetona, trenutno uporabniško vlogo in po potrebi lastništvo izleta ali prijave. To je pomembno, ker organizator ne sme urejati tujih izletov, udeleženec pa ne sme odobravati objav. Strežniške seje so veljavna alternativa, vendar je za načrtovani ločeni REST API izbran pristop z dostopnimi žetoni.

## Posledice

**Pozitivne:**

- Preverjanje identitete in vlog na strežniški strani; gesla niso shranjena v berljivi obliki.

**Negativne:**

- Treba je varovati žetone, določiti njihov kratek rok veljavnosti in obravnavati potek; pri spremembi pravic ni dovolj zaupati le podatkom v starejšem žetonu.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
