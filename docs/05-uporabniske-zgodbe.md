# 5. Uporabniške zgodbe – TripHarbor

## 5.1 Namen in obseg

Dokument pretvori vseh **15 funkcionalnosti** iz dokumenta `02-funkcionalnosti-in-obseg.md` v uporabniške zgodbe s konkretnimi, preverljivimi kriteriji sprejemljivosti (*acceptance criteria*). Zgodbe **US-01–US-07** spadajo v **MVP**, zgodbe **US-08–US-15** pa so načrtovane **za kasneje**. Registracija, prijava, odjava in preverjanje uporabniških pravic so podporne sistemske zmožnosti, opredeljene v prvi nalogi, in niso dodatno štete med 15 vsebinskih funkcionalnosti.

Uporabljene vloge so **udeleženec (PARTICIPANT)**, **organizator (ORGANIZER)** in **administrator (ADMIN)**. Organizator se lahko kot udeleženec prijavi na izlete drugih organizatorjev. Kriteriji opisujejo pričakovano vedenje sistema in so podlaga za preverjanje implementacije.

## 5.2 Uporabniške zgodbe – MVP

### US-01 – Iskanje in filtriranje izletov

- **Povezana funkcionalnost:** F-01 – Iskanje in filtriranje izletov
- **Uporabniška vloga:** Udeleženec
- **Obseg:** MVP
- **Uporabniška zgodba:** *Kot udeleženec želim poiskati in filtrirati objavljene izlete po destinaciji, datumu, kategoriji in zahtevnosti, da lahko hitro najdem izlet, ki ustreza mojim interesom in razpoložljivemu času.*

**Kriteriji sprejemljivosti:**
1. Ob odprtju pregleda izletov sistem prikaže samo izlete s statusom `PUBLISHED`.
2. Ob vnosu destinacije sistem prikaže izlete, katerih destinacija ustreza iskalnemu izrazu, ne glede na velike ali male črke.
3. Uporabnik lahko nastavi datum oziroma datumsko obdobje, kategorijo in zahtevnost; pri več izbranih filtrih sistem prikaže samo izlete, ki ustrezajo vsem izbranim pogojem.
4. Ob odstranitvi filtra se rezultati ponovno izračunajo glede na preostale pogoje.
5. Če ni ustreznih izletov, sistem prikaže sporočilo »Ni najdenih izletov« in omogoči ponastavitev filtrov.

### US-02 – Interaktivni zemljevid izletov

- **Povezana funkcionalnost:** F-02 – Interaktivni zemljevid izletov
- **Uporabniška vloga:** Udeleženec
- **Obseg:** MVP
- **Uporabniška zgodba:** *Kot udeleženec želim videti lokacije objavljenih izletov na interaktivnem zemljevidu, da lahko izberem izlet glede na njegovo geografsko lego.*

**Kriteriji sprejemljivosti:**
1. Zemljevid prikaže označevalce samo za objavljene izlete, ki imajo določene koordinate destinacije.
2. Označevalec je postavljen na geografsko širino in dolžino destinacije, povezane z izletom.
3. Ob izbiri označevalca sistem prikaže vsaj naslov izleta, destinacijo in datume.
4. Uporabnik lahko iz izbranega označevalca odpre stran s podrobnostmi ustreznega izleta.
5. Če zemljevida zaradi napake zunanje storitve ni mogoče naložiti, sistem prikaže obvestilo o napaki, ne da bi preprečil uporabo običajnega seznama izletov.

### US-03 – Priprava izleta in načrtovanje programa

- **Povezana funkcionalnost:** F-03 – Priprava izleta in načrtovanje programa
- **Uporabniška vloga:** Organizator
- **Obseg:** MVP
- **Uporabniška zgodba:** *Kot organizator želim ustvariti osnutek izleta in mu dodati časovno urejen program aktivnosti, da lahko pred oddajo v odobritev predstavim celoten načrt izleta.*

**Kriteriji sprejemljivosti:**
1. Prijavljeni uporabnik z vlogo `ORGANIZER` lahko ustvari izlet z naslovom, opisom, destinacijo, kategorijo, zahtevnostjo, začetnim in končnim datumom, zbirnim mestom ter največjim številom udeležencev; nov izlet dobi status `DRAFT`.
2. Sistem zavrne shranjevanje izleta, če je končni datum pred začetnim ali če je največje število udeležencev manjše od 1, ter označi neveljavna polja.
3. Organizator lahko svojemu osnutku doda aktivnost z naslovom, datumom, lokacijo in vrstnim redom; opis in začetni čas sta lahko dodatna podatka.
4. Organizator lahko ureja ali odstrani aktivnosti svojega osnutka in določi njihov vrstni red; spremembe so vidne pri ponovnem odprtju osnutka.
5. Organizator ne more spreminjati osnutkov drugih organizatorjev; nepooblaščena zahteva je zavrnjena na strežniku.

### US-04 – Samodejno preverjanje skladnosti programa izleta

- **Povezana funkcionalnost:** F-04 – Samodejno preverjanje skladnosti programa izleta
- **Uporabniška vloga:** Organizator
- **Obseg:** MVP
- **Uporabniška zgodba:** *Kot organizator želim pred oddajo izleta samodejno preveriti skladnost programa aktivnosti, da lahko pravočasno odpravim napake v datumih in razporedu.*

**Kriteriji sprejemljivosti:**
1. Ob sprožitvi preverjanja sistem za vsako aktivnost preveri, ali je njen datum med začetnim in končnim datumom izleta, vključno z obema mejnima datumoma.
2. Če sta dve aktivnosti istega izleta na isti dan načrtovani ob istem določenem začetnem času, sistem prikaže opozorilo z navedbo obeh aktivnosti; aktivnosti brez določenega začetnega časa se pri tem preverjanju preskočijo.
3. Če vrstni red aktivnosti (`sort_order`) na posamezen dan ne sledi naraščajočim določenim začetnim časom, sistem prikaže opozorilo z navedbo zadevnih aktivnosti.
4. Če je datum katerekoli aktivnosti zunaj trajanja izleta, sistem zavrne oddajo izleta v administrativni pregled in navede, katere aktivnosti je treba popraviti.
5. Po popravkih lahko organizator ponovno sproži preverjanje; če ni neveljavnih datumov, je oddaja v pregled dovoljena, morebitna opozorila o podvojenih časih ali vrstnem redu pa ostanejo vidna. Preverjanje prekrivanja celotnega trajanja aktivnosti ni vključeno, ker model nima končnih časov aktivnosti.

### US-05 – Prijava na izlet

- **Povezana funkcionalnost:** F-05 – Prijava na izlet
- **Uporabniška vloga:** Udeleženec
- **Obseg:** MVP
- **Uporabniška zgodba:** *Kot udeleženec želim oddati ali preklicati prijavo na objavljen izlet in spremljati njen status, da vem, ali se bom lahko udeležil izleta.*

**Kriteriji sprejemljivosti:**
1. Prijavljen uporabnik lahko odda prijavo samo na izlet s statusom `PUBLISHED`, na katerega so prijave še odprte; nova prijava dobi status `PENDING`.
2. Če ima uporabnik za isti izlet že prijavo s statusom `PENDING` ali `ACCEPTED`, sistem ne ustvari nove prijave in mu prikaže obstoječi status.
3. Uporabnik lahko prekliče lastno prijavo s statusom `PENDING` ali `ACCEPTED`; njen status se spremeni v `CANCELLED`.
4. Po preklicu lahko uporabnik ponovno odda prijavo; sistem obstoječi zapis `CANCELLED` spremeni v `PENDING`, ne da bi ustvaril podvojen zapis. Po statusu `REJECTED` samodejna ponovna prijava ni dovoljena.
5. V pregledu »Moje prijave« uporabnik vidi svoje prijave z naslovom izleta in aktualnim statusom, ne pa prijav drugih uporabnikov.

### US-06 – Upravljanje prijav in kapacitet

- **Povezana funkcionalnost:** F-06 – Upravljanje prijav in kapacitet
- **Uporabniška vloga:** Organizator
- **Obseg:** MVP
- **Uporabniška zgodba:** *Kot organizator želim pregledovati ter sprejemati ali zavračati prijave na svoje izlete, da lahko izberem udeležence in ohranim število potrjenih mest znotraj kapacitete.*

**Kriteriji sprejemljivosti:**
1. Organizator vidi seznam prijav na izlet, katerega lastnik je, skupaj s statusi prijav; do prijav na tuje izlete nima dostopa.
2. Organizator lahko prijavo s statusom `PENDING` spremeni v `ACCEPTED` ali `REJECTED`; sistem shrani odločitev in čas pregleda (`reviewed_at`).
3. Sistem pri sprejemu prijave preveri, ali je število že sprejetih prijav manjše od `max_participants`; ko je kapaciteta dosežena, sprejem dodatne prijave zavrne.
4. Če organizatorja oziroma dve zahtevi hkrati potrjujeta zadnje prosto mesto, sistem s transakcijsko zaščito zagotovi, da število sprejetih prijav ne preseže kapacitete.
5. Ob preklicu prej sprejete prijave se število zasedenih mest zmanjša za eno; število prostih mest je enako kapaciteti minus število prijav `ACCEPTED`.

### US-07 – Odobritev objave izleta

- **Povezana funkcionalnost:** F-07 – Odobritev objave izleta
- **Uporabniška vloga:** Administrator
- **Obseg:** MVP
- **Uporabniška zgodba:** *Kot administrator želim pregledati predlagane izlete ter odobriti ali zavrniti njihovo objavo, da so javno vidni samo pregledani izleti.*

**Kriteriji sprejemljivosti:**
1. Organizator lahko svoj osnutek odda v pregled; če prestane obvezna preverjanja programa, se status izleta spremeni iz `DRAFT` v `PENDING`.
2. Administrator vidi seznam izletov s statusom `PENDING` in lahko odpre njihove osnovne podatke ter program aktivnosti.
3. Ob odobritvi administrator spremeni status izleta iz `PENDING` v `PUBLISHED`; izlet se nato pojavi v javnem iskanju in na zemljevidu.
4. Ob zavrnitvi administrator spremeni status izleta iz `PENDING` v `REJECTED`; tak izlet ni prikazan med javno objavljenimi izleti.
5. Uporabnik brez vloge `ADMIN` ne more odobriti ali zavrniti objave; backend nepooblaščeno zahtevo zavrne.

## 5.3 Uporabniške zgodbe – kasnejše funkcionalnosti

Naslednje zgodbe opisujejo načrtovane nadgradnje in **niso del obvezne implementacije MVP**. Nekatere bodo zahtevale dodatne podatkovne entitete, kot so `favorites`, `waitlist_entries`, `reviews`, `notifications` in `trip_expenses`.

### US-08 – Pregled mojih izletov

- **Povezana funkcionalnost:** F-08 – Pregled mojih izletov
- **Uporabniška vloga:** Udeleženec
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot udeleženec želim pregledati svoje prihajajoče, pretekle in odpovedane izlete, da imam pregled nad načrtovanimi in preteklimi udeležbami.*

**Kriteriji sprejemljivosti:**
1. Sistem v razdelku »Moji izleti« prikaže izlete, za katere ima uporabnik potrjeno prijavo oziroma jo je imel pred odpovedjo izleta.
2. Izleti s prihodnjim začetnim datumom in brez statusa `CANCELLED` so prikazani med prihajajočimi, izleti s preteklim končnim datumom med preteklimi.
3. Izleti s statusom `CANCELLED` so prikazani v ločeni skupini odpovedanih izletov, ne glede na datum.
4. Vsak zapis prikazuje vsaj naslov, destinacijo, datum in status izleta ter omogoča odpiranje podrobnosti.
5. Uporabnik vidi samo svoje izlete; če v izbrani skupini ni izletov, sistem prikaže ustrezno prazno stanje.

### US-09 – Čakalni seznam

- **Povezana funkcionalnost:** F-09 – Čakalni seznam
- **Uporabniška vloga:** Udeleženec
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot udeleženec želim vstopiti na čakalni seznam zapolnjenega izleta, da lahko dobim možnost udeležbe, če se sprosti mesto.*

**Kriteriji sprejemljivosti:**
1. Ko število potrjenih prijav doseže `max_participants`, sistem pri objavljenem izletu ponudi možnost vpisa na čakalni seznam.
2. Prijavljen uporabnik se lahko na čakalni seznam istega izleta vpiše samo enkrat.
3. Sistem ob vpisu shrani uporabnika, izlet, čas vpisa in položaj v vrstnem redu.
4. Uporabnik lahko preveri svoj položaj in se s čakalnega seznama odstrani.
5. Če izlet ni objavljen ali uporabnik že ima potrjeno udeležbo, sistem novega vpisa na čakalni seznam ne dovoli.

### US-10 – Samodejno sproščanje mest

- **Povezana funkcionalnost:** F-10 – Samodejno sproščanje mest
- **Uporabniška vloga:** Udeleženec
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot udeleženec na čakalnem seznamu želim prejeti ponudbo za sproščeno mesto po vrstnem redu prijave, da imam pravično možnost udeležbe na izletu.*

**Kriteriji sprejemljivosti:**
1. Ko se potrjena prijava prekliče in nastane prosto mesto, sistem poišče prvega aktivnega uporabnika na čakalnem seznamu za ta izlet.
2. Sistem prvemu uporabniku pošlje ponudbo za mesto in zabeleži njen status; istega mesta hkrati ne ponudi več uporabnikom.
3. Uporabnik lahko ponudbo sprejme ali zavrne; ob sprejemu sistem preveri razpoložljivo kapaciteto in ustvari oziroma posodobi ustrezno prijavo.
4. Če uporabnik ponudbo zavrne, sistem ponudi mesto naslednjemu upravičenemu uporabniku v vrsti.
5. Tudi pri sočasnih spremembah prijav število potrjenih udeležencev ne preseže `max_participants`.

### US-11 – Priljubljeni izleti

- **Povezana funkcionalnost:** F-11 – Priljubljeni izleti
- **Uporabniška vloga:** Udeleženec
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot udeleženec želim shraniti zanimive izlete med priljubljene, da jih lahko pozneje hitro ponovno najdem.*

**Kriteriji sprejemljivosti:**
1. Prijavljen uporabnik lahko na strani objavljenega izleta izbere možnost »Dodaj med priljubljene«.
2. Isti uporabnik ne more istega izleta dodati med priljubljene več kot enkrat.
3. Razdelek »Priljubljeni izleti« prikazuje samo izlete, ki jih je shranil trenutni uporabnik.
4. Uporabnik lahko izlet odstrani iz priljubljenih; po odstranitvi ni več prikazan na njegovem seznamu.
5. Iz seznama priljubljenih lahko uporabnik odpre podrobnosti posameznega izleta.

### US-12 – Ocene in mnenja

- **Povezana funkcionalnost:** F-12 – Ocene in mnenja
- **Uporabniška vloga:** Udeleženec
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot udeleženec želim po zaključenem izletu oceniti svojo izkušnjo in organizatorja, da lahko drugim uporabnikom pomagam pri izbiri izleta.*

**Kriteriji sprejemljivosti:**
1. Sistem omogoči oddajo ocene samo uporabniku s potrjeno udeležbo (`ACCEPTED`) na izletu, katerega končni datum je že minil in ki ni odpovedan.
2. Uporabnik lahko vnese številčno oceno od 1 do 5 in besedilni komentar; ocena zunaj dovoljenega razpona je zavrnjena.
3. Posamezen uporabnik lahko za isti izlet odda največ eno oceno.
4. Po uspešni oddaji se ocena shrani skupaj z uporabnikom in izletom ter je prikazana v razdelku ocen izleta.
5. Sistem pri prikazu ocen organizatorja izračuna povprečje njegovih prejetih številčnih ocen; če ocen ni, prikaže »Še brez ocen«.

### US-13 – Obvestila o spremembah

- **Povezana funkcionalnost:** F-13 – Obvestila o spremembah
- **Uporabniška vloga:** Udeleženec
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot udeleženec želim prejeti obvestilo o spremembi statusa prijave, programa ali odpovedi izleta, da pravočasno izvem za spremembe, ki vplivajo na mojo udeležbo.*

**Kriteriji sprejemljivosti:**
1. Ko organizator prijavo sprejme ali zavrne, sistem ustvari obvestilo za uporabnika, ki je prijavo oddal.
2. Ko organizator spremeni program objavljenega izleta, sistem ustvari obvestilo za uporabnike s statusom prijave `ACCEPTED`.
3. Ob odpovedi izleta sistem ustvari obvestilo za uporabnike z aktivno prijavo (`PENDING` ali `ACCEPTED`).
4. Vsako obvestilo vsebuje vrsto dogodka, naslov izleta, čas nastanka in povezavo do ustreznega izleta oziroma prijave.
5. Uporabnik vidi samo svoja obvestila in lahko posamezno obvestilo označi kot prebrano.

### US-14 – Predvideni stroški izleta

- **Povezana funkcionalnost:** F-14 – Predvideni stroški izleta
- **Uporabniška vloga:** Organizator
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot organizator želim navesti predvidene stroške aktivnosti in skupni proračun izleta, da udeleženci pred prijavo poznajo okvirne stroške.*

**Kriteriji sprejemljivosti:**
1. Organizator lahko za svoj izlet doda stroškovne postavke z opisom, zneskom in valuto.
2. Sistem zavrne negativne zneske in zahteva, da ima vsaka postavka določeno valuto.
3. Sistem izračuna vsoto postavk, izraženih v isti valuti, in jo prikaže kot predvideni skupni strošek; zneskov v različnih valutah ne sešteva brez pretvorbe.
4. Organizator lahko postavko popravi ali odstrani; prikazana vsota se po spremembi posodobi.
5. Udeleženec na strani objavljenega izleta vidi postavke in skupni predvideni strošek z oznako, da gre za oceno, ne za spletno plačilo.

### US-15 – Odpoved izleta

- **Povezana funkcionalnost:** F-15 – Odpoved izleta
- **Uporabniška vloga:** Organizator
- **Obseg:** Kasneje
- **Uporabniška zgodba:** *Kot organizator želim odpovedati svoj načrtovani izlet, da so prijavljeni uporabniki pravočasno seznanjeni, da izlet ne bo izveden.*

**Kriteriji sprejemljivosti:**
1. Organizator lahko sproži odpoved samo za svoj izlet, ki še ni zaključen in nima statusa `CANCELLED`.
2. Sistem pred dokončno odpovedjo zahteva potrditev dejanja.
3. Po potrditvi sistem status izleta spremeni v `CANCELLED` in izlet odstrani iz rezultatov iskanja objavljenih izletov.
4. Sistem povezane aktivne prijave (`PENDING` in `ACCEPTED`) označi kot `CANCELLED`; zavrnjene in že preklicane prijave ostanejo nespremenjene.
5. Prijavljeni uporabniki vidijo odpovedan status izleta in povezanih prijav; po odpovedi nove prijave niso več dovoljene.

## 5.4 Pregled povezav med funkcionalnostmi in zgodbami

| Oznaka | Funkcionalnost | Vloga | Obseg |
|---|---|---|---|
| US-01 | F-01 – Iskanje in filtriranje izletov | Udeleženec | **MVP** |
| US-02 | F-02 – Interaktivni zemljevid izletov | Udeleženec | **MVP** |
| US-03 | F-03 – Priprava izleta in načrtovanje programa | Organizator | **MVP** |
| US-04 | F-04 – Samodejno preverjanje skladnosti programa izleta | Organizator | **MVP** |
| US-05 | F-05 – Prijava na izlet | Udeleženec | **MVP** |
| US-06 | F-06 – Upravljanje prijav in kapacitet | Organizator | **MVP** |
| US-07 | F-07 – Odobritev objave izleta | Administrator | **MVP** |
| US-08 | F-08 – Pregled mojih izletov | Udeleženec | Kasneje |
| US-09 | F-09 – Čakalni seznam | Udeleženec | Kasneje |
| US-10 | F-10 – Samodejno sproščanje mest | Udeleženec | Kasneje |
| US-11 | F-11 – Priljubljeni izleti | Udeleženec | Kasneje |
| US-12 | F-12 – Ocene in mnenja | Udeleženec | Kasneje |
| US-13 | F-13 – Obvestila o spremembah | Udeleženec | Kasneje |
| US-14 | F-14 – Predvideni stroški izleta | Organizator | Kasneje |
| US-15 | F-15 – Odpoved izleta | Organizator | Kasneje |

## 5.5 Upoštevanje načel INVEST

Zgodbe so zapisane z vidika vrednosti za uporabnika in imajo preverljive kriterije sprejemljivosti. Pri njihovem načrtovanju so upoštevana načela **INVEST**:

- **Independent (neodvisne):** vsaka zgodba ima lasten cilj in oznako; kjer je potrebna predhodna funkcionalnost (npr. čakalni seznam pred samodejno ponudbo mesta), je odvisnost razvidna iz opisa.
- **Negotiable (prilagodljive):** način prikaza, oblikovanje in tehnične podrobnosti se lahko med razvojem prilagodijo, če ostane dogovorjeno vedenje iz kriterijev izpolnjeno.
- **Valuable (koristne):** vsaka zgodba opredeli korist za udeleženca, organizatorja ali administratorja.
- **Estimable (ocenljive):** kriteriji omejujejo obseg in omogočajo oceno zahtevnosti izvedbe.
- **Small (dovolj majhne):** zgodbe so vezane na eno od 15 funkcionalnosti; širše zgodbe, zlasti US-03, US-05, US-06 in US-10, se lahko pri implementaciji razdelijo na manjše razvojne naloge brez spreminjanja obsega funkcionalnosti.
- **Testable (preverljive):** kriteriji določajo vhodne pogoje, dejanja, pričakovane statuse, omejitve in odzive sistema.

**Opomba o obsegu:** Funkcionalnosti, označene kot »Kasneje«, so del načrta razvoja, ne pa zahtevane implementacije MVP. Njihovi kriteriji opisujejo ciljno vedenje prihodnjih različic in ne pomenijo, da so ustrezne dodatne tabele ali storitve že vključene v osnovni podatkovni model.
