# Wikidata Experimental Adapter

Serves as an adapter to the Wikidata ontology API service and the official Wikidata SPARQL endpoint.
The entypoint is the `wikidata-adapter.ts` which cointains the `WikidataAdapter` class.

The class is used inside the client applications editor and additionaly is access inside the Wikidata add interpreted surroundings dialog, a Wikidata detail dialog and a Wikidata search dialog. 
The adapter itself contains ontology connector and SPARQL endpoint connector.
The connectors are used for calling the appropriate backend services.
The adapter also defines Wikidata entities and formats, together with transformation functions, that are used in the rest of the Dataspecer.

To learn more about the model visit the [ds-wdoi](https://github.com/dataspecer/ds-wdoi) project.

- The adapter folder structure:
  - `wikidata-entities`
    - Contains defitions of classes and properties as in the Wikidata ontology.
    - The same as the entities in the Wikidata API service, but reduced so they would not contain too much data.
  - `wikidata-ontology-connector`
    - Contains a connector class that enables the adapter to access the Wikidata ontology API service.
    - The connector to the backend does the transformation to the model based on `wikidata-entities`.
  - `wikidata-sparql-endpoint-connector`
    - Contains a connector class that enables the adapter to access the Wikidata public SPARQL endpoint.
    - It contains SPARQL queries, which must be prebuild.
  - `wikidata-to-dataspecer-entity-adapter` 
    - Contains adapters for each Wikidata entity.
    - The entities are transformed to the Dataspecer model entities.

## How to start development?

1. `> git clone repository`
2. `> cd repository`
3. `> git fetch`
4. `> git switch feature/wikidata`
5. `> npm install`
6. `> npm run build`
7. `> cd ./application/client`
8. Create new `.env.local` where you add url to the Dataspecer backend and to the Wikidata ontology API service.
9. `> npm run build:watch`
10. Open your localhost at 3000
11. To see changes in code do:
   1.  from root run `> cd packages/wikidata-experimental-feature`
   2.  `> npm run build:watch` simultaneously with 9. command inside client.
   3.  to build queries run `> npm run prebuild` and then again `> npm run build:watch` to refresh the references.

- Sometimes in visual studio code, the imports show up red after build.
- To make it green again, reload the window (F1, and type Reload window).