# MapLibre GL JS, OpenFreeMap in Nominatim

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Udeleženci morajo izlete iskati tudi na interaktivnem zemljevidu, organizatorji pa potrebujejo lokacije destinacij. Za MVP je pomembna rešitev brez odvisnosti od plačljivega komercialnega zemljevida.

## Obravnavane možnosti

- MapLibre GL JS + OpenFreeMap + Nominatim
- Google Maps Platform
- Leaflet z ločeno storitvijo ploščic in geokodiranja

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: MapLibre GL JS + OpenFreeMap + Nominatim.** Odločitev je primerna za TripHarbor, ker MapLibre omogoča interaktiven zemljevid, OpenFreeMap zagotavlja kartografsko podlago, Nominatim pa iskanje lokacij; kombinacija ustreza načrtovanemu MVP brez uvajanja komercialnega API ključa.

### Posledice

**Pozitivne:**

- Interaktiven prikaz izletov; manjša začetna odvisnost od plačljive storitve.

**Negativne:**

- Treba je spoštovati pogoje in omejitve javnih storitev, zlasti Nominatim; razpoložljivost zunanjih virov ni pod našim nadzorom.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
