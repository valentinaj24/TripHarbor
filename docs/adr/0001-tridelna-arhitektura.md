# Tridelna arhitektura

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

TripHarbor potrebuje uporabniški vmesnik za udeležence, organizatorje in administratorja, poslovna pravila za prijave ter trajno shranjevanje povezanih podatkov. Če bi bili vsi deli prepleteni, bi spremembe pravil vplivale tudi na prikaz in shranjevanje.

## Obravnavane možnosti

- Tridelna arhitektura (odjemalec, API, podatkovna baza)
- Enotna aplikacija z neposredno povezano predstavitveno in podatkovno logiko
- Odjemalec z neposrednim dostopom do baze

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Tridelna arhitektura.** Odločitev je primerna za TripHarbor, ker ločitev prikaza, poslovnih pravil in podatkov omogoča, da se preverjanje vlog, odobritve objav in omejitve kapacitet izvajajo na strežniku, ne v brskalniku.

### Posledice

**Pozitivne:**

- Jasnejše odgovornosti posameznih plasti; lažje neodvisno testiranje API-ja.

**Negativne:**

- Več povezav med deli sistema; potrebno je usklajevanje podatkovnih pogodb.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
