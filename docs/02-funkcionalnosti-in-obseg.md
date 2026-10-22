
# 2. Funkcionalnosti in obseg rešitve – TripHarbor

## 2.1 Uporabniške vloge

Spletna aplikacija TripHarbor vključuje tri glavne uporabniške vloge: udeleženca, organizatorja in administratorja. Vsaka vloga ima jasno določene odgovornosti, pravice in omejitve, ki omogočajo varno, pregledno in učinkovito uporabo sistema.

### 1. Udeleženci (Participants)

Udeleženci so uporabniki, ki želijo poiskati in se pridružiti organiziranim skupinskim izletom ali potovanjem.

**Pravice:**
- Iskanje in filtriranje izletov glede na destinacijo, datum, kategorijo in zahtevnost.
- Pregled razpoložljivih izletov na interaktivnem zemljevidu.
- Pregled podrobnosti izleta, programa aktivnosti in razpoložljivih mest.
- Oddaja in preklic prijave na izlet.
- Spremljanje statusa svojih prijav.
- Shranjevanje priljubljenih izletov in oddajanje ocen po zaključeni udeležbi (v kasnejših različicah).

**Omejitve:**
- Ne morejo ustvarjati ali objavljati izletov.
- Ne morejo urejati izletov drugih uporabnikov.
- Ne morejo potrjevati ali zavračati prijav drugih uporabnikov.
- Nimajo dostopa do administrativnih funkcij ali zasebnih podatkov drugih uporabnikov.

### 2. Organizatorji (Organizers)

Organizatorji so uporabniki, ki načrtujejo in vodijo skupinske izlete ter upravljajo prijave udeležencev. V prvi različici lahko uporabnik pridobi vlogo organizatorja z ročno dodelitvijo administratorja; samostojen sistem zahtevkov ni del MVP.

**Pravice:**
- Ustvarjanje izletov z opisom, destinacijo, datumom, kategorijo, zahtevnostjo in omejitvijo števila udeležencev.
- Oblikovanje programa izleta z aktivnostmi, lokacijami in časovnim potekom.
- Oddaja izleta v pregled administratorju.
- Urejanje lastnih osnutkov izletov.
- Pregled prejetih prijav na lastne izlete.
- Sprejemanje ali zavračanje prijav ob upoštevanju razpoložljivih mest.
- Pregled seznama potrjenih udeležencev.
- Prijava na izlete drugih organizatorjev.

**Omejitve:**
- Ne morejo urejati ali upravljati izletov drugih organizatorjev.
- Ne morejo samostojno odobriti javne objave svojih izletov.
- Ne morejo potrditi več udeležencev, kot dovoljuje kapaciteta izleta.
- Nimajo pravic za administrativno upravljanje uporabniških računov.

### 3. Administratorji (Administrators)

Administratorji so skrbniki platforme, odgovorni za preverjanje in odobravanje objav izletov, upravljanje uporabniških vlog ter nadzor ustreznosti vsebin.

**Pravice:**
- Pregled izletov, ki čakajo na odobritev.
- Odobritev ali zavrnitev javne objave izleta.
- Umik neprimernih ali zavajajočih izletov.
- Pregled uporabniških računov; omejevanje dostopa uporabnikom, ki kršijo pravila platforme, je predvideno za kasnejšo različico.
- Dodeljevanje vloge `ORGANIZER` uporabnikom, ki želijo organizirati izlete.
- Obravnava prijav neprimerne vsebine (v kasnejših različicah).

**Omejitve:**
- Ne morejo spreminjati osebnih podatkov uporabnikov brez ustrezne podlage.
- Ne morejo oddajati prijav na izlete v imenu drugih uporabnikov.
- Ne upravljajo običajnega postopka sprejemanja ali zavračanja prijav udeležencev, saj je to odgovornost organizatorjev.
- Dostopajo lahko samo do podatkov, ki so potrebni za izvajanje administrativnih nalog.

## 2.2 Predvidene funkcionalnosti

Spodaj so navedene predvidene funkcionalnosti aplikacije TripHarbor. Funkcionalnosti z oznako **MVP** predstavljajo osnovni obseg prve delujoče različice.

| Št. | Funkcionalnost | Opis | Obseg |
|---|---|---|---|
| 1 | Iskanje in filtriranje izletov | Iskanje izletov po destinaciji ter filtriranje glede na datum, kategorijo in zahtevnost. | **MVP** |
| 2 | Interaktivni zemljevid izletov | Prikaz lokacij objavljenih izletov na zemljevidu z možnostjo izbire posameznega izleta. | **MVP** |
| 3 | Priprava izleta in načrtovanje programa | Organizator ustvari in ureja osnutek izleta, določi destinacijo, datume, kapaciteto ter pripravi časovno urejen program aktivnosti z lokacijami. | **MVP** |
| 4 | Samodejno preverjanje skladnosti programa izleta | Sistem preveri, ali so datumi aktivnosti znotraj trajanja izleta, ali imajo aktivnosti na isti dan podvojene začetne čase in ali so razvrščene kronološko. Prikaže konkretna opozorila; izleta z neveljavnimi datumi ni mogoče oddati v odobritev. | **MVP** |
| 5 | Prijava na izlet | Udeleženec odda ali prekliče prijavo na izbrani izlet in spremlja njen status. | **MVP** |
| 6 | Upravljanje prijav in kapacitet | Organizator sprejema ali zavrača prijave, sistem pa preprečuje prekoračitev števila razpoložljivih mest. | **MVP** |
| 7 | Odobritev objave izleta | Administrator pregleda predlagani izlet in odloči o njegovi javni objavi. | **MVP** |
| 8 | Pregled mojih izletov | Uporabnik spremlja svoje prihajajoče, pretekle in odpovedane izlete. | Kasneje |
| 9 | Čakalni seznam | Ko so mesta zapolnjena, se lahko uporabnik uvrsti na čakalni seznam. | Kasneje |
| 10 | Samodejno sproščanje mest | Ob odpovedi udeležbe sistem ponudi prosto mesto naslednjemu uporabniku na čakalnem seznamu. | Kasneje |
| 11 | Priljubljeni izleti | Uporabnik lahko shrani zanimive izlete za kasnejši pregled. | Kasneje |
| 12 | Ocene in mnenja | Udeleženci lahko po zaključku izleta ocenijo izkušnjo in organizatorja. | Kasneje |
| 13 | Obvestila o spremembah | Sistem uporabnika obvesti o potrditvi prijave, spremembi programa ali odpovedi izleta. | Kasneje |
| 14 | Predvideni stroški izleta | Organizator navede okvirne stroške aktivnosti in skupni predvideni proračun. | Kasneje |
| 15 | Odpoved izleta | Organizator lahko odpove izlet, sistem pa posodobi njegov status in povezane prijave. | Kasneje |

Poleg navedenih vsebinskih funkcionalnosti bo aplikacija omogočala tudi registracijo, prijavo, odjavo, osnovno upravljanje uporabniškega profila in preverjanje pravic glede na uporabniško vlogo.

Ob registraciji uporabnik pridobi vlogo `PARTICIPANT`. V MVP vlogo `ORGANIZER` uporabniku ročno dodeli administrator; samostojen postopek oddaje in spremljanja zahtevkov ni predviden. Vloga `ADMIN` se dodeljuje izključno prek nadzorovanega administrativnega postopka.

### Obseg prve različice (MVP)

Prva delujoča različica aplikacije bo vključevala naslednjih sedem ključnih funkcionalnosti:

1. Iskanje in filtriranje izletov.
2. Interaktivni zemljevid izletov.
3. Priprava izleta in načrtovanje programa.
4. Samodejno preverjanje skladnosti programa izleta.
5. Oddaja in preklic prijave na izlet ter spremljanje njenega statusa.
6. Upravljanje prijav in kapacitet.
7. Odobritev objave izleta.

Osnovni poslovni proces bo potekal po naslednjem zaporedju:

**Organizator pripravi izlet in program → sistem preveri skladnost programa → administrator odobri objavo → udeleženec poišče izlet in odda prijavo → organizator potrdi ali zavrne prijavo → sistem posodobi število razpoložljivih mest.**

MVP bo tako omogočal celoten proces organizacije skupinskega izleta, od priprave in samodejnega preverjanja programa do objave in potrjene udeležbe. Preverjanje časovnih konfliktov temelji na začetnih časih aktivnosti; preverjanje dejanskega prekrivanja trajanja ni predvideno, saj model ne vsebuje končnih časov aktivnosti.

## 2.3 Kasnejše nadgradnje

Po zaključku osnovne različice so predvidene naslednje možnosti nadgradnje:

1. **Personalizirana priporočila izletov:** priporočanje izletov na podlagi uporabnikovih interesov, priljubljenih kategorij in preteklih prijav.
2. **Skupinski klepet:** komunikacija med organizatorjem in potrjenimi udeleženci posameznega izleta.
3. **Vremenska napoved:** prikaz vremenskih razmer za destinacijo in datum načrtovanega izleta.
4. **Optimizacija poti:** predlaganje učinkovitega vrstnega reda obiska lokacij znotraj programa izleta.
5. **Večjezična podpora:** možnost uporabe aplikacije v več jezikih.
6. **Integracija s koledarjem:** izvoz potrjenih izletov v Google Calendar ali druge koledarske aplikacije.
7. **Napredna analitika za organizatorje:** statistika prijav, zasedenosti izletov in zanimanja za posamezne destinacije.

Nadgradnje bodo izvedene postopoma glede na razpoložljiv čas in nadaljnje zahteve projekta.

## 2.4 Funkcionalnosti izven obsega (Out of scope)

V okviru projekta niso predvidene naslednje funkcionalnosti:

- **Spletna plačila:** aplikacija ne bo omogočala neposrednega plačevanja izletov ali obdelave bančnih kartic.
- **Rezervacija letalskih vozovnic in nastanitev:** TripHarbor ne bo deloval kot turistična agencija ali rezervacijski sistem za hotele in letalske prevoze.
- **Sledenje uporabnikom v realnem času:** aplikacija ne bo spremljala trenutne GPS-lokacije udeležencev med izletom.
- **Uradno preverjanje turističnih ponudnikov:** sistem ne bo izvajal pravnega preverjanja licenc ali registracij turističnih agencij.
- **Samodejno načrtovanje in rezervacija celotnih potovanj z umetno inteligenco:** aplikacija ne bo samostojno ustvarjala in rezervirala celotnih potovanj brez sodelovanja organizatorja.

TripHarbor bo osredotočen na odkrivanje, načrtovanje in organizacijo skupinskih izletov ter upravljanje prijav, ne pa na prodajo celovitih turističnih paketov.
