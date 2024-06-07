# Wikidata entity detail

Contains detail dialog component used in surroundings and search dialog.
To use the `WikidataEntityDetailDialog`, it is necessary to create the `WikidataAdapterContext`, so the components could use the backend API calls.

The dialog is "click-through" meaning clicking on entities will move to the entity detail.
The user can then use a back button to return to the previous entity.

The dialog also enables a usage of a confirm button.
To allow the confirm, one must provide the confirm action, the confirm buton text and the confirm button disable when function.
It is used in the search dialog, where a user can browse the classes and properties and select classes as a root or properties to the search filter. 

The dialog checks what Wikidata entity is currently present for a detail and passes the entity into the detail tab component.
The tab components is generic and assumes also a declarative list of values and tabs to display.