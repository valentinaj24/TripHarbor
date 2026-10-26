# Tridelna arhitektura aplikacije

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

V TripHarborju bodo udeleženci iskali izlete, organizatorji urejali programe in prijave, administratorji pa odobravali objave. Prikaz podatkov zato ne sme biti isto mesto, kjer se odloča, kdo lahko potrdi prijavo ali objavi izlet.

## Obravnavane možnosti

- Tridelna arhitektura.
- Aplikacija z uporabniškim vmesnikom in poslovno logiko v enem delu.
- Neposreden dostop odjemalca do podatkovne baze.

## Sprejeta odločitev in utemeljitev

Za TripHarbor je izbrana tridelna arhitektura, ki ločuje uporabniški vmesnik, poslovno logiko in podatkovno bazo. Prikaz prostih mest se lahko tako spremeni neodvisno od pravila, ki organizatorju preprečuje sprejem več udeležencev, kot jih dovoljuje kapaciteta. Neposreden dostop iz brskalnika do podatkovne baze ni primeren, saj bi otežil preverjanje dovoljenj in poslovnih pravil.

## Posledice

**Pozitivne:**

- Pravila za vloge in kapacitete bodo na enem mestu v backendu; posamezne dele bo lažje preverjati in spreminjati.

**Negativne:**

- Potrebna je komunikacija med tremi deli in dodatna nastavitev povezav ter obravnave napak.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
