# Wikidata Add Interpreted Surroundings Dialog

The Add Interpreted Surroudings dialog used for browsing the Wikidata ontology surroundings.
The entry point is the `wikidata-add-interpreted-surroundings-dialog.tsx` that contains the main exported dialog to be used in the application.

- Root folder structure:
  - `wikidata-ancestors-selector-panel`
    - Contains components for the left side of the surroundings dialog for ancestors selection.
    - Mimics the behaviour of the default ancestor selector panel.
  - `wikidata-properties-panel`
    - Contains components for the right side of the surroundings dialog for property selection.
  - `context`
    - React contexts for using the Wikidata adapter and additional adapter APIs.
  - `helpers`
    - Components and function that can be used in other components freely (e.g. loading circle, error dialog...)
  - `hooks`
    - Hooks for simplified calling of the Wikidata adapter API.
  - `wikidata-entities-detail-dialog`
    - A dialog that shows when clicking `(i)` button on entities.
    - Diaplays detail of the entity.
  - `property-selection-record`
    - Contains records that are stored when user selects a property.
    - When the user confirms selection in the main dialog.
    - The Wikidata properties are transformed into the Dataspecer associations and attributes.

## Overview

The most important is the set up of the `WikidataAdapterContext` which then provides the Wikidata adapter to the rest of the components.

Starting from the entrypoint `WikidataAddInterpretedSurroundingsDialog`.
The dialog is provided with a Wikidata class IRI which then starts loading of it's surroundings through the `WikidataAdapter`.
The selected class is refered to as a root class.
When user selects a different ancestor from the ancestor selector panel, the newly selected class is refered to as a selected class.
For each entity a detail dialog can be shown (`WikidataEntityDetailDialog`).

After the loading, the main dialog displays it's two panels: `WikidataAncestorsSelectorPanel` and `WikidataPropertiesPanel`.
The freshly started dialog displays properties for the root class.
When user selects a different ancestor (a selected class), the Wikidata adapter is used to obtain surroundings for the selected class.

By clicking on a property, a user adds the property into a selection. 
The same property cannot be selected multiple times (the Dataspecer cannot handle it).
The selection is based on the subject and object of the property, and a user is always asked to choose those when selecting an (backwards) association or, in general, when allowing to display inherited properties.
This is crucial, since Dataspecer needs to know from where the property is inherited, the rest of the inheritance is done in the native Dataspecer model.

- A surroundings dialog content:
  - `WikidataAncestorsSelectorPanel` 
    - Displays a simple list of ancestors of the selected root class.
    - Clicking on an ancestors selects the ancestors as a selected class and displays its surroundings in the properties panel.
  - `WikidataPropertiesPanel`
    - Displays filtering options and lists containing the properties grouped into accordion based on whether the property is: association, attribute, backward association, and external identifier (an attribute which contains URI to other data source). The separation was done to improve overall performance when displaying thousands of properties.
    - When a user selects a property, it is added to a list of selected properties.
    - Main components:
      - The `WikidataProperties` components encompasses the splitting properties into groups and displaying appropriate accordions (`WikidataPropertiesAccordion`) within infinity scroll lists (`WikidataInfinityScrollList`).
        - If an ancestor is selected that is not a root, a `WikidataLoadedProperties` component is used to download the ancestor's surroundings before it is passed to `WikidataProperties`.
        - Infinity scroll lists are used to handle the thousands of properties to be displayed. More properties are used when a user scrolls the lists.
      - The properties can be managed by `WikidataManageSelectedDialog`.
        - Enables a user to edit already selected properties.
        - Auser cannot select the same property multiple times.
        - See below in *Selecting properties and transformations to the Dataspecer model*.
      - The properties can be filtered by the `WikidataFilterByInstanceDialog`.
          - Enables to insert a URI of an instance and filter the properties by the properties used on the instance.
          - A warning is displayed when an instance that does not belong the currently selected ancestor tree.
          - Note that the instance must not be a class otherwise it would take too long, since it is the same statistics computation as is done in preprocessing.
      - When clicking on a property a `WikidataPropertySelectionDialog` is displayed.
        - Displays when a user clicks on a property and the property is either association (must select domain/range) or the option to include inherited properties is on.

## Contexts

The dialog uses three context for easier manipulation.

- React query client
  - A React query client from the `react-query` library that is used for simplified handling of requests to the backend.
  - It is used by the React hooks inside `hooks` folder.
  - It is set up to cache the requests for 10 minutes.
- Wikidata adapter context
  - Contains a `WikidataAdapter` which then enables components to access functions to query the Wikidata ontology API service and the Wikidata SPARQL endpoint.
-  Property selection
   - Contains a list of selected properties.

## Hooks 

Each backend call is defined as a hook using the Wikidata adapter and the React query client.
The hooks return the basic information about the requests as in `react-query` library.

## Selecting properties and transformations to the Dataspecer model.

The property selection record defines a property selection which is stored inside Property selection context.
Each property selection is defined by the:
  1.  `WikidataPropertyType` - an association, an attribute, an external identifier attribute, and backwards associatoin.
  2. A property.
  3. A subject class.
  4. An object class (is be empty for attributes).
  
A property can be selected only once based on the above provided definitions.
You must note that the Dataspecer does not provide a way to handle properties with multiple domains and ranges.
Also it does not handle inheritance itself.
When selecting a property which is inherited, the user is prompted to choose an ancestor defining the property.
When selecting the domain/range a user is also prompted to select the range/domain.
The selection is scrict and disallows user to select the same property with the same configuration of type, property, subject, and object.

When a user is satified by the selection and confirms it.
The properties are then transformed to the Dataspecer model (`property-selection-record/transform-selected-surroundings.ts`).

- **Important**:
  - Since the user can select the property multiple times with different configuration.
  - And because Dataspecer does not allow multiple domains and ranges.
  - Each selection is defined as a separate Dataspecer attribute/association with IRI describing the selection's definition.
  - It is sort of "hacking" the properties into the Dataspecer, since it is cannot handle (right now) the ontology as is. 

Main dialogs:
- `WikidataPropertySelectionDialog`
  - Handles selection when an including inherited properties flag is checked or the property is association/backwards association.
  - The dialog steps through selecting a parent and/or domain/range.
  - The filtering by instance is also active here, but can be turned off.
- `WikidataManageSelectedDialog`
  - The dialog can be used to modify selected properties.
  - All the rules mentioned above apply here as well.
  - Inside the dialog, the selection is treated as if the "include inherited" was checked.

## Filter by instance with `WikidataFilterByInstanceDialog`

The filter by instance dialog enables a user to input an instance IRI and filter properties for the currently selected ancestor.
The filter filters out properties which are not used on the instance.
A warning is displayed when the instance is not part of the currently selected ancestor tree.
A user cannot select a class, otherwise it would mean computing the same statistics as were done in the preprocessing.
Also note that the IRIs might contain some query or #.

It is possible that the SPARQL query in the background fails on timeout.
I have changed numerous times, it seems it depends on the current usage of the Wikidata endpoints, sometimes it finishes and sometimes it does not finish.
