# Ločena frontend in backend aplikacija

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Strani Explore, Trip Details in nadzorni plošči organizatorja ter administratorja bodo imele veliko interakcij. Hkrati mora backend samostojno preverjati pravice in izvajati postopke prijav.

## Obravnavane možnosti

- Ločena React aplikacija in REST backend.
- Strežniško izrisovanje strani v eni aplikaciji.
- Ena aplikacija z neposredno povezavo na bazo.

## Sprejeta odločitev in utemeljitev

Frontend in backend bosta ločeni aplikaciji, povezani prek REST API-ja. Takšna ločitev omogoča razvoj in preverjanje API-ja v Postmanu tudi pred dokončanjem obrazcev v Reactu. Pravila o lastništvu izletov in kapacitetah bodo preverjena na backendu, zato ne bodo odvisna od tega, iz katerega odjemalca pride zahteva. Strežniško izrisovanje v eni aplikaciji bi bilo mogoče, vendar za načrtovani interaktivni vmesnik in samostojno preverjanje API-ja ni izbrano.

## Posledice

**Pozitivne:**

- Lažje ločeno testiranje API-ja in uporabniškega vmesnika; jasna meja odgovornosti.

**Negativne:**

- Potrebna je ureditev API-klicev, razvojnega proxyja oziroma CORS ter usklajevanje podatkovnih tipov med aplikacijama.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
