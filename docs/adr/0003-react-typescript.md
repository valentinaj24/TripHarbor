# React in TypeScript za uporabniški vmesnik

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Na strani za raziskovanje izletov se bodo spreminjali filtri, seznam rezultatov in zemljevid. Podobni podatki o izletu bodo prikazani tudi na strani s podrobnostmi in v organizatorjevi nadzorni plošči.

## Obravnavane možnosti

- React s TypeScriptom.
- React z JavaScriptom.
- Vue.
- Navadni HTML in JavaScript.

## Sprejeta odločitev in utemeljitev

Za uporabniški vmesnik sta izbrana React in TypeScript. React omogoča ponovno uporabo kartic izletov, filtrov in obrazcev na straneh Explore, Trip Details in nadzornih ploščah. TypeScript pomaga pri preverjanju oblik podatkov, kot so status izleta, datumi in število prostih mest. React brez TypeScripta bi zahteval manj začetne nastavitve, vendar bi omogočal manj preverjanja podatkovnih tipov med razvojem.

## Posledice

**Pozitivne:**

- Ponovna uporaba komponent in bolj pregledno delo z oblikami podatkov; manj napak pri spreminjanju modelov.

**Negativne:**

- Za manjše spremembe je treba vzdrževati tipe; na začetku je nekaj več nastavitev kot pri navadnem JavaScriptu.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
