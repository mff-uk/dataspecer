[back to main](./main.md)

# Developer documentation

## Motivation

Conceptual modeling aims on creating abstract representations of systems to simplify communication between people involved and builds certain standards on knowledge exchange. It identifies entities, relationships, and constraints within a domain.
Application profiles are customized specifications that define how a set of concepts should be used for a particular application or domain.

### Similar tools

There are multiple conceptual modeling tools that let you model in ERD (entity-relationship diagrams), UML, flowcharts etc. `dscme` is a browser-based, open-source conceptual model editor. It is, by the looks of it, similar to other tools like Protégé Web, WebVOWL, and maybe others. It provides an environment for ontology and data modeling. Like these tools, it supports multiple models and offers various views on concepts, allowing for easier interaction. However, `dscme` differs by supporting IRIs for all resources, enabling precise identification and linking of web-based data. Additionally, by setting for example base IRIs for models and supporting application profiles, `dscme` offers more tailored and versatile metadata management capabilities compared to the more general features of other conceptual modeling tools.

## Chronological Progress Report

-   prototyp ve figme
-   iterace s jointjs, navrh reseni s nim
-   napojeni na core 5/2023
    -   nahrani rdf slovniku
    -   napojeni na sgov
    -   jeho zobrazeni na platno
    -   in-memory slovniky 6/2023
-   zkoumani jinych knihoven https://docs.google.com/spreadsheets/d/1b2dZXq4GI3eeqNKxobrqYva_OaLz0sEm9ggqtvr7-pE/edit#gid=0
    -   nakonec reactflow
-   predelani do core-v2 8-12/2023
    -   prekopani cele aplikace
    -   napojeni na backend
    -   manipulace s koncepty
-   napojeni na reactflow, corev2 EO2023
-   barvicky pro modely
-   visualni modely pro core-v2
-   ruzne views
-   01/2024, pull request
    -   krabicky na platne maji atributy
    -   hrany na platne maji barvicky, popisy a kardinality
    -   view management
    -   dialogy na pridani modelu (modely nejsou zapecene v kodu), pridani relationshipu, modifikaci entit
    -   napojeni na backend
-   02/2024
    -   spatne se renderovaly hrany, novy pristup k jejich renderovani
    -   support pro zmenu views ve vizualizaci
    -   vytvoreni lokalniho project manageru
    -   implementace na backendove servise
        -   listovani packages
        -   podpora barev u modelu
    -   nacteni package rovnou pri otevreni stranky, `package-id` query parametr
    -   detail dialog tedka ukaze atributy u tridy
-   03/2024
    -   vizualizace se nekresli z naseho stavu, ale je napojena pouze na zmeny z aggregatoru
        -   nehrozi tak zbytecne vykreslovani, pokud neni treba
    -   pokus o automatický layouting, nebudu nakonec delat, at si an tom nekdo dalsi udela vyzkumak
    -   generovani jmen, at nejsou prazdne dialogy
    -   color picker misto uplne volneho vybirani barev
    -   nacitani `view-id` take z query param
    -   zmenit `usages` na `profiles`
    -   vlastne vubec zacatek prace s apliakcnimi profily
    -   propsani jazyku i do vizualizace, ted se meni vsude
    -   pridani vazby profil->class
-   04/2024
    -   hierarchicky pohled na profily
    -   ted uz se to zaclo hojne pouzivat
    -   tvori se prvnich par datasetu pro dalsi vyzkumak - LLM asistent
    -   autogenerovane iri podle jmena
    -   vylepseni dialogu na novou hranu, ustaleni vzdhledu vsech dialogu
    -   disablovatelne casti v dialogach
    -   nova classa na `alt`+click na platno
    -   aliasy modelu
    -   lepsi labels u kardinalit
    -   aspon jeden lokalni model pri nacteni
    -   prekopirovani barev do noveho view
    -   podpora lehciho profilovani -> predkopirovani hodnot
    -   **pulka dubna**
    -   prekopano naprosto, jak se chovame k hranam, nebylo dokumentovano
    -   prepsani hran do noveho zpusobu
    -   zasah do corev2, aby se to tam naprogramovalo
    -   podpora pro rozliseni atributu a relaci
    -   uprava lw-onto generatoru pro praci s novym pristupem k hranam
    -   vykuchani mojich util funkci namisto tech novych, sdilenych z corev2
    -   zacinam citit time-crunch, stejne se kupi prace
    -   util funkce pro lepsi vypreparovani jmen, popisu apod v jazyku
    -   warningy?
    -   editace base iri
    -   slinkovani generalization/speciialation do detailu
    -   context menus
    -   agregator tedka kombinuje informace u profilu - co profil neprepise, zdedi se ze vzoru
        -   override checkbox
    -   hrany muzou mit ruzne poradi source/target -> musel jsem zmenit
-   05/2024
    -   profily nakonec taky musi mit IRI
    -   podpora relativni/absolutni iri
    -   refaktoring slozek
    -   podpora pro datove typy, rozsiritelne jednoduse
    -   absolutni iricka do lw-ontologie
        -   teda jenom te v dscme, backend to ma bez, pac nema informace o puvodu konceptu
    -   sjednoceni dialogovoych tlacitek
    -   proxy na cteni dat jednodusejc
    -   drag-n-drop
    -   autosave na backend
    -   dalsi refaktory, samozaviraci colorpicker, contextmenu
    -   odlozeni odevzdavani
    -   zacatek dokumentace
    -   vyreseni 👁/🕶
    -   ukazovani override i po ukonceni dialogu
    -   fixovani padlych pipelines kvuli chybe v package-lock dalsiho studenta
    -   integrace na manager, i na builtin manager podle prostredi, kde se vyviji
    -   dialogy v provideru
    -   hups, chybely generalizace pro veci jine nez tridy, v interface to vypadalo, ze to ma byt jen pro tridy
        -   labely pro geralizace
        -   modifikacni dialog pridava nove generalizace
        -   muze je dokonce mazat i z vicero slovniku najednou
    -   zpetna vazba na save buttonu
    -   package a view query params nakonec v jednom hooku, delaly problem, kdyz byly z ruznych mist

## Decisions and future improvements

-   dialogy v provideru
-   proxy pro cteni dat je fajn, mohla by se mozna dal vyuzit na modifikace(?)

## dalsi prace

-   pridani barev - staci doplnit barvicky do color palette
-   jak se chovat k hranam a atributum
