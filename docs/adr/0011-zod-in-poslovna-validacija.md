# Zod in strežniška poslovna validacija

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

API sprejema podatke o izletih in aktivnostih, ki so lahko napačnega tipa ali v nasprotju s poslovnimi pravili. Program aktivnosti mora upoštevati datume izleta, kronološki vrstni red in podvojene začetke.

## Obravnavane možnosti

- Zod za obliko podatkov + preverjanje pravil v storitvah
- Ročna validacija vseh polj
- Validacija samo na frontendu

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Zod za obliko podatkov + preverjanje pravil v storitvah.** Odločitev je primerna za TripHarbor, ker Zod preveri strukturo in tipe vhodnih podatkov, medtem ko storitveni sloj preverja pravila, odvisna od več aktivnosti in stanja izleta; samo frontend validacija bi se lahko obšla.

### Posledice

**Pozitivne:**

- Jasna ločitev tehničnih in poslovnih preverjanj; enotna zaščita vseh API zahtevkov.

**Negativne:**

- Pravila so razdeljena med sheme in storitve; treba je dosledno razlikovati blokirajoče napake in opozorila.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
