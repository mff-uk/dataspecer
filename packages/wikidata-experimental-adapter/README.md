# Wikidata experimental adapter v2

A second iteration of a Wikidata integration to the Dataspecer tool.
The client queries the Wikidata backend with extracted ontology.

## How to start it up for development?

1. `> git clone repository`
2. `> cd repository`
3. `> git fetch` just in case
4. `> git switch feature/wikidata-adapter`
5. `> npm install`
6. `> npx lerna bootstrap`
7. `> npx lerna run build`
8. `> cd ./application/client`
9. create new `.env.local` where you add url to the Dataspecer backend
10. `> npm run build:watch`
11. open your localhost at 3000
12. to see changes in code do:
   1.  from root run `> cd packages/wikidata-experimental-feature`
   2.  `> npm run build:watch` simultaneously with 7. command inside client.
   3.  to build queries run `> npm run prebuild` and then again `> npm run build:watch`