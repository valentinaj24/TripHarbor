# Modularni monolit za strežniško aplikacijo

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

TripHarbor je projekt omejenega obsega, ki ga razvija ena oseba. Funkcionalnosti uporabnikov, izletov, aktivnosti in prijav so močno povezane, posebej pri odobritvah in preverjanju kapacitet.

## Obravnavane možnosti

- Modularni monolit
- Mikrostoritve
- Nestrukturiran monolit

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Modularni monolit.** Odločitev je primerna za TripHarbor, ker omogoča ločene module za uporabnike, izlete in prijave, hkrati pa enoten zagon in enostavnejše transakcije; mikrostoritve bi za trenutni obseg dodale nepotrebno komunikacijo in uvajanje.

### Posledice

**Pozitivne:**

- Jasne meje modulov in predvidljiv vzdrževalni odtis; enostavnejši razvoj, testiranje in uvajanje.

**Negativne:**

- Napaka lahko vpliva na celotno strežniško aplikacijo; meje modulov je treba zavestno ohranjati.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
