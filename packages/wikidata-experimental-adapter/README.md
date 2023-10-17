# Wikidata experimental adapter

## What can it do?

- full hierarchy
  - children
  - parents
- surroundings
  - parents in height 1
  - children in depth 1
  - attributes (wikidata properties that do not point to items based on subject contraint)
  - associations
    - internaly there are outward pimAssociations but I need to add pimClasses for the endpoints.
## How to start it up?

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