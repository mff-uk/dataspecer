[back to main](./main.md)

# Developer documentation

## Motivation

Stručné uvedení do problematiky, kterou projekt řeší

Zasazení vytvořeného díla do kontextu existujících programových děl řešících obdobnou problematiku

chronologický popis průběhu prací na projektu:

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
    -

kritické zhodnocení přijatých řešení a možnosti dalšího vývoje

Uživatelská dokumentace musí obsahovat zejména:

Podrobný popis instalace díla včetně přesné specifikace požadavků na použitý hardware a software

Popis všech funkcí díla

Způsob ovládání díla
