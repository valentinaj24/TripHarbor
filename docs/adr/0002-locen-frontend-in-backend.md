# Ločen frontend in backend

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Uporabniški vmesnik vključuje iskanje, zemljevid in urejanje programa, strežnik pa mora preverjati pravice in izvajati transakcije. Potrebna je meja, ki preprečuje izvajanje občutljivih pravil samo v odjemalcu.

## Obravnavane možnosti

- Ločena React aplikacija in strežniški API
- Strežniško izrisovanje strani v eni aplikaciji
- Enotna aplikacija brez ločenega API-ja

## Sprejeta odločitev in utemeljitev

**Izbrana možnost: Ločena React aplikacija in strežniški API.** Odločitev je primerna za TripHarbor, ker interaktivni zemljevid in obrazci ostanejo v odjemalcu, pravila za objave, prijave in kapacitete pa so centralizirana v API-ju, ki ga je mogoče testirati ločeno.

### Posledice

**Pozitivne:**

- Neodvisen razvoj in testiranje vmesnika ter API-ja; jasna meja za preverjanje pravic.

**Negativne:**

- Potrebno je urediti CORS, avtentikacijo in usklajevanje tipov zahtevkov.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
