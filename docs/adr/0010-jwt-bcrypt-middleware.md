# JWT, bcrypt in middleware za dostop

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Udeleženec, organizator in administrator imajo različne pravice. Strežnik mora prepoznati uporabnika, varno shraniti gesla in preprečiti, da bi udeleženec odobril objavo ali upravljal tuje prijave.

## Obravnavane možnosti

- JWT + bcrypt + Express middleware
- Seje na strežniku + bcrypt
- Zunanja upravljana storitev za identiteto

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: JWT + bcrypt + Express middleware.** Odločitev je primerna za TripHarbor, ker JWT ustreza ločenemu odjemalcu in REST API-ju, bcrypt ščiti shranjena gesla, middleware pa centralizira preverjanje prijave in vlog pred izvajanjem poslovne logike.

### Posledice

**Pozitivne:**

- Centralno preverjanje identitete in vlog; gesla niso shranjena v čisti obliki.

**Negativne:**

- Potrebno je pravilno upravljanje ključev, poteka žetonov in odjave; preverjanje lastništva izleta mora ostati tudi v storitvah.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
