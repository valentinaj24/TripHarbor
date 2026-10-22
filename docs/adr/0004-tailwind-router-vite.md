# Tailwind CSS, React Router in Vite

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Frontend potrebuje dosleden videz, prehode med javnimi in zaščitenimi pogledi ter hitro lokalno razvojno okolje. Projekt razvija ena oseba, zato je pomembno zmanjšati konfiguracijo.

## Obravnavane možnosti

- Tailwind CSS + React Router + Vite
- Lastni CSS + ročno usmerjanje + Webpack
- Komponentna UI knjižnica in drugo razvojno orodje

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Tailwind CSS + React Router + Vite.** Odločitev je primerna za TripHarbor, ker Tailwind omogoča hitro oblikovanje odzivnih pogledov, React Router loči poti za udeleženca, organizatorja in administratorja, Vite pa poenostavi zagon in gradnjo React aplikacije.

### Posledice

**Pozitivne:**

- Hitrejše oblikovanje wireframeov v komponente; pregledna navigacija; enostaven razvojni zagon.

**Negativne:**

- Razredi Tailwind lahko postanejo nepregledni; usmerjanje v brskalniku samo po sebi ne zagotavlja avtorizacije.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
