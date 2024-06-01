# dscme poznámky

-   jde spíše o implementační projekt, nepřicházíme s převratnými výpočty měnícími svět

## Práce s dscme

-   cíl dscme je mít lightweight editor konceptuálních modelů, který je:
    -   dostupný téměř všude, proto je to webová aplikace, nemusí se nic instalovat
    -   (snad) jednoduchý na použití
        -   v rámci délky projektu by mohl jistě být o dost horší
    -   napojený na Dataspecer toolset
    -   schopný práce s vícero modely zároveň, umožňuje to tak přepoužívání konceptů, které už existují

### Modelovací koncepty

-   pracujeme s koncepty 'class', 'relationship', 'generalization', 'class profile', 'relationship profile'.
    -   relationship je nadtřída pro 'attribute', interně se atributy reprezentují jako relace, v aplikaci se pro uživatele odlišují

### Zdroje dat

-   modelář buď tvoří modely od píky, těm říkáme lokální modely
-   může přepoužít již existující modely

    -   podporujeme modely v souborech `rdf` vystavené na internetu
        -   nahrávání ze souboru ne-e, infrastrukturně nejsme připraveni souboru ukládat k sobě
        -   v budoucnu by nejspíše takové rozšíření šlo
    -   TBI napojení na sparql endpoint
        -   jediný sparql endpoint, který momentálně podporujeme je slovník.gov.cz
        -   máme pro něj přímo vytvořený adaptér, díky kterému dokážeme z endpointu nahrávat data
        -   v budoucnu nebude velká překážka mít generičtější adaptér, který by se dokázal napojit i na jiné endpointy
    -   přepoužití konceptů se hodí v případě, že chceme dodat svoje vlastní doménové znalosti k něčemu, co již existuje
        -   např tak říct, že párek v rohlíku z hořčicí (přepoužitý z modelu `bufet`) lze kombinovat i s lanýžovou omáčkou (přepoužitá z modelu `gurmánské pochoutky`)

<br />

-   i různé přepoužité modely mohou přidávat informace o konceptech
-   pro zkombinování informací v takové situaci používáme interní komponentu agregátor, která dělá přesně to

### Běžné modelování

-   `dscme` by měl podporovat většinu funkcionalit, které podporují základní modelovací nástroje
-   to jsou:

    -   vytváření, modifikace konceptů
    -   umísťování na plátno
    -   vytváření vztahů mezi nimi, tvorba dědičnosti

-   při práci s hodně koncepty najednou se také hodí nemít je všechny na plátně
-   dáváme modeláři možnost mít více pohledů na jednu hromádku dat, `view`/`diagram`
    -   modelář si tak vybere, co je přesně oblast jeho zájmu v danou chvíli, pouze s těmi koncepty může na plátně v rámci `view` pracovat

### Odlišení od jiným modelovacích nástrojů

dscme má navíc oproti dalším modelovacím nástrojům

-   podporu pro práci s více slovníky najednou
    -   barevné odlišení
    -   aliasy pro slovníky
-   přípravu pro práci s koncepty na webu, konceptům uživatel tvoří iri
    -   base iri se přiřazuje slovníkům
-   podporu pro [profilování](#profilování)
-   generování lightweight ontologíí z dat ve workspace
-   napojení do dataspecer toolsetu

Na druhou stranu se `dscme` liší od ostatních commercial-grade modelovacích nástrojů tím, že jde pouze o školní projekt vytvořený v rámci jednotek měsíců. Nemůžeme mít modelářům za zlé, že očekávají podobnou funkcionalitu, jakou dostanou v jiných nástrojích. Z hlediska času i velikosti a zkušenosti vývojářského týmu bohužel bude mít `dscme` svoje nedostatky a nebude vždy fungovat tak, jak by zkušený modelář očekával.

### Profilování

-   profily jsou něco navíc, co dscme přináší
-   vytvoření profilu konceptu je prostá tvorba nového konceptu typu (class|relationship) profile
-   při tvoření profilů se běžně upřesňují vlastnosti profilovaného konceptu, zbylé vlastnosti se přepoužívají/dědí
-   dscme nabízí možnost přepsat pouze některé vlastnosti konceptu explicitním zaškrtnutím při tvorbě profilu, ostatní vlastnosti se převezmou
-   hotový profil se tak tváří, že má vlastnosti profilovaného konceptu, ale jen je přebírá
    -   pokud se nepřepsaná vlastnost změní u profilovaného konceptu, profil si převezme
    -   při přepsání toto neplatí
-   profil musí mít také své vlastní iri, to předvytváříme za modeláře
    -   přilepíme `-profile` za původní iri
    -   pokud modelář mění název, měníme ho také
    -   iri si modelář může dotvořit dle libosti, dále už nezasahujeme

### Zobrazení detailů

-   detailní informace si modelář zobrazí v detailovém dialogu
-   jsou tam
    -   jméno
    -   popis
    -   vztahy dědičnosti, rodiče a potomci
    -   iri
        -   prokliknutelné, hodí se pro koncepty z přepoužitých modelů
    -   název modelu, ze kterého koncept je
    -   u vztahů navíc
        -   doména s kardinalitou, prokliknutelná (zobrazí koncept)
        -   range s kardinalitou, stejně
        -   pro atributy je místo range datový typ

## Featury dscme

-   předvyplnění IRI
-   ukládání specifikací na backend
-   generování LW ontologie
    -   napojeno na core lw generátor, jednoduchá změna v lw-onto-gen a na FE se nemusí nic dělat

## Technické poznámky

-   pouze FE aplikace
-   do budoucna by mohlo být modelování řízeno backendem, to by odemklo možnost modelování pro víc osob

### Vícero slovníků

-   o konceptech získávám informace z agregátoru
-   modely se kterými pracujeme ve workspace se drží ve stavu aplikace, můžou se a ukládají se pak na backend
-   modely mají svoje:
    -   id pro rozlišení
    -   alias pro modeláře
    -   base iri, aby to zjednodušilo práci s koncepty
    -   obarvení, které se tedy drží ve `view`/`diagramu`, odkazuje se ale dvojici `[modelId, barvičkaId]`
-   lokální modely mají možnost pro přidávání nových konceptů
-
