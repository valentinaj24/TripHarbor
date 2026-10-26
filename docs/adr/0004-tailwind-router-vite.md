# Tailwind CSS, React Router in Vite

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

TripHarbor potrebuje različne strani za iskanje, podrobnosti izleta, prijave in administracijo. Pomembno je, da imajo strani enoten videz in da jih je mogoče med razvojem hitro preizkušati.

## Obravnavane možnosti

- Tailwind CSS ali lastni CSS.
- React Router ali ročno upravljanje prikazanih strani.
- Vite ali kompleksnejša konfiguracija gradnje.

## Sprejeta odločitev in utemeljitev

Za oblikovanje je izbran Tailwind CSS, za navigacijo React Router, za lokalni razvoj pa Vite. Tailwind omogoča enotne razmike in odzivne postavitve kartic, filtrov ter obrazcev. React Router bo povezoval ločene strani, vključno s podrobnostmi posameznega izleta, Vite pa poenostavi zagon in sprotno preverjanje sprememb. Lastni CSS in ročno preklapljanje strani sta mogoča, vendar bi zahtevala več ponavljajočega se dela.

## Posledice

**Pozitivne:**

- Enoten videz, jasna navigacija in hitrejši lokalni razvoj.

**Negativne:**

- Tailwind lahko zaradi številnih razredov zmanjša preglednost kode JSX; navigacijo in dovoljenja za dostop do posameznih poti je treba pravilno urediti.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
