# React in TypeScript za frontend

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

TripHarbor vsebuje več povezanih interaktivnih pogledov: seznam in filtre izletov, zemljevid, podrobnosti ter organizatorske obrazce. Podatki o izletih in prijavah se prenašajo prek API-ja.

## Obravnavane možnosti

- React s TypeScriptom
- Vue s TypeScriptom
- Vanilla JavaScript brez komponentnega ogrodja

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: React s TypeScriptom.** Odločitev je primerna za TripHarbor, ker ponovno uporabne komponente olajšajo gradnjo kartic, obrazcev in prikazov stanj, TypeScript pa pomaga odkriti neskladja med podatki API-ja in komponentami že med razvojem.

### Posledice

**Pozitivne:**

- Ponovna uporaba komponent; preverjanje tipov pri modelih izletov in prijav.

**Negativne:**

- Potreben je začetni dogovor o strukturi komponent in tipih; TypeScript ne nadomesti preverjanja podatkov na strežniku.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
