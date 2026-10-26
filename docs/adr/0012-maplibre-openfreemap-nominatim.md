# MapLibre GL JS, OpenFreeMap in Nominatim za zemljevid

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Interaktivni zemljevid je del MVP, ker je pomembno, da uporabnik poleg seznama vidi, kje potekajo objavljeni izleti. Pri ustvarjanju izleta mora organizator določiti destinacijo.

## Obravnavane možnosti

- MapLibre GL JS z OpenFreeMap in Nominatim.
- Google Maps Platform.
- Lasten zemljevid in geografski podatki.

## Sprejeta odločitev in utemeljitev

Za zemljevid je izbran MapLibre GL JS, za zemljevidne ploščice OpenFreeMap, za geokodiranje destinacij pa Nominatim. Tako bo mogoče prikazati objavljene izlete na zemljevidu in poiskati koordinate krajev brez razvoja lastnega geografskega sistema. Google Maps Platform je alternativa, vendar za študentski MVP ni izbrana zaradi večje odvisnosti od komercialne storitve. Pri uporabi javnega Nominatima bodo upoštevane omejitve in pogoji uporabe.

## Posledice

**Pozitivne:**

- Zemljevid in geokodiranje sta dosegljiva brez lastne geografske infrastrukture; rešitev podpira prikaz destinacij po svetu.

**Negativne:**

- Delovanje zemljevida in iskanja lokacij je odvisno od razpoložljivosti in pogojev zunanjih storitev. Javni Nominatim ni primeren za neomejeno število zahtev.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
