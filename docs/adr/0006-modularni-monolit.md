# Modularni monolit za strežniško aplikacijo

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Prijave, izleti, uporabniki in administrativne odobritve so povezani. Ker gre za samostojen razvoj projekta, je pomembna pregledna razdelitev kode brez potrebe po upravljanju več ločenih strežnikov.

## Obravnavane možnosti

- Modularni monolit.
- Mikrostoritve.
- Monolit brez jasne delitve na module.

## Sprejeta odločitev in utemeljitev

Backend bo zasnovan kot modularni monolit: ena aplikacija z ločenimi moduli `auth`, `users`, `trips`, `registrations` in `admin`. Za samostojen razvoj je takšna zasnova enostavnejša za zagon in testiranje kot več mikrostoritev. Povezani postopki, na primer sprejem prijave in preverjanje kapacitete, lahko ostanejo znotraj iste aplikacije in podatkovne transakcije. Monolit brez modulov ni izbran, ker bi sčasoma otežil pregled nad poslovnimi pravili.

## Posledice

**Pozitivne:**

- En sam backend za lokalni zagon in testiranje; lažje usklajevanje povezanih poslovnih pravil; pregledna razdelitev kode po funkcionalnostih.

**Negativne:**

- Napaka v skupnem procesu lahko vpliva na celoten backend. Če meje med moduli niso jasno določene, lahko nastane preveč medsebojnih odvisnosti.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
