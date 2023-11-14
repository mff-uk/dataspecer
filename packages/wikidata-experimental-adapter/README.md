# Wikidata experimental adapter

A first iteration of a Wikidata integration to the Dataspecer tool.
The client queries the Wikidata SPARQL endpoint.

## Comments

- The root search
  - It queries entire Wikidata, that means the root can be any entity from the Wikidata, including instances and properties.
  - It should handle only English language as of now.
- Hierarchy
  - The hierarchy is made up of following `subclass of` properties to the parents.
  - Using the SPARQL it can follow the `subclass of` property in reverse order and get children.
- Surroundings
  - For each part of the surroundings (parents, children and associations with endpoints) stands a separate SPARQL query.
  - Parents and children are the same as in hierarchy but only in the depth 1.
  - Associations:
    - Associations are created from `subject type` and `value type` constraints on properties.
    - To find properties of a class it queries the SPARQL for properties that the class can be `subject of` or `value of`. 
    - If the class is `subject of` a property, then associations are created so that the `value types` are the ends of outgoing edge. In reverse if the class is `value of` a property, then the incoming edges are with endpoints of the `subject types` of the property.
    - If the class is a `subject of`  property but the property has a literal type, then it is an attribute. 

## What can it do?

- search
  - search based on string
  - search based on iri
- full hierarchy
  - children
  - parents
- surroundings
  - parents in height 1
  - children in depth 1
  - attributes (wikidata properties that do not point to items based on subject contraint)
  - associations 
  
## How to start it up for development?

1. `> git clone repository`
2. `> cd repository`
3. `> git fetch` just in case
4. `> git switch feature/wikidata-adapter`
5. `> npm install`
6. `> npx lerna bootstrap`
7. `> npx lerna run build`
8. `> cd ./application/client`
9. `> npm run build:watch`
10. open your localhost at 3000
11. to see changes in code do:
   1.  from root run `> cd packages/wikidata-experimental-feature`
   2.  `> npm run build:watch` simultaneously with 7. command inside client.
   3.  to build queries run `> npm run prebuild` and then again `> npm run build:watch`