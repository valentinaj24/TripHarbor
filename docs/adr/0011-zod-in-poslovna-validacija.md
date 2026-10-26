# Zod in preverjanje poslovnih pravil

- **Status:** Sprejeto
- **Datum:** 2026-10-22
- **Nadomešča:** Ni

## Kontekst in problem

Organizator bo vnašal datume izleta, kapaciteto in aktivnosti. Napačni tipi podatkov ali neveljavni datumi bi lahko povzročili napačno objavo. Preveriti je treba tudi pravila, ki primerjajo več aktivnosti.

## Obravnavane možnosti

- Zod in ločeno preverjanje v storitvah.
- Ročno preverjanje vseh polj.
- Preverjanje samo v obrazcih.

## Sprejeta odločitev in utemeljitev

Za preverjanje vhodnih podatkov je izbran Zod, dodatna poslovna pravila pa bodo izvedena v storitvenem sloju backenda. Zod bo preverjal zahtevana polja in obliko podatkov, storitve pa bodo primerjale datume aktivnosti s trajanjem izleta, zaznavale podvojene začetne čase na isti dan in preverjale kronološki vrstni red. Samo preverjanje obrazcev ne bi zadostovalo, saj je API mogoče poklicati tudi brez frontenda. Dejanskega prekrivanja trajanja aktivnosti ni mogoče preveriti, ker podatkovni model ne vsebuje končnega časa.

## Posledice

**Pozitivne:**

- Jasnejše napake pri vnosu in ločeno preverjanje pravil celotnega programa; enaka pravila veljajo ne glede na frontend.

**Negativne:**

- Potrebni sta dve ravni preverjanja, ki morata biti med seboj usklajeni. Opozorila in sporočila o napakah morajo biti uporabniku razumljiva.

## Povezave

- [Arhitektura in tehnološki sklad](../04-arhitektura-in-tehnoloski-sklad.md)
