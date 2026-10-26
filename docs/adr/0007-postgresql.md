# PostgreSQL za shranjevanje podatkov

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Uporabniki, destinacije, izleti, aktivnosti in prijave so povezani. Za posameznega uporabnika mora obstajati največ ena prijava na isti izlet, število sprejetih prijav pa ne sme preseči kapacitete.

## Obravnavane možnosti

- PostgreSQL.
- MongoDB.
- SQLite.

## Sprejeta odločitev in utemeljitev

Za podatkovno bazo je izbran PostgreSQL, saj podatkovni model TripHarbora temelji na povezavah med uporabniki, destinacijami, izleti, aktivnostmi in prijavami. Tuji ključi in enolična omejitev za kombinacijo `trip_id` ter `user_id` pomagajo preprečevati nedosledne podatke. Pri sprejemanju prijav so potrebne tudi transakcije in ustrezna zaščita pred sočasnimi potrditvami. MongoDB bi zahteval drugačno zasnovo povezanih podatkov, SQLite pa ni izbran kot glavna baza ločenega strežniškega dela.

## Posledice

**Pozitivne:**

- Povezave med petimi entitetami so jasno določene; omejitve in transakcije pomagajo ohranjati pravilne podatke.

**Negativne:**

- PostgreSQL je treba zagnati in vzdrževati; samo uporaba transakcije še ne reši tekmovalnih pogojev brez ustrezne izolacije oziroma zaklepanja.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
