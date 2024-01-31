# Wikidata experimental adapter v2

A second iteration of a Wikidata integration to the Dataspecer tool.
The client queries the Wikidata backend with extracted ontology.

## How to start it up for development?

1. `> git clone repository`
2. `> cd repository`
3. `> git fetch` just in case
4. `> git switch feature/wikidata-adapter`
5. `> npm install`
6. `> npm run build`
7. `> cd ./application/client`
8. create new `.env.local` where you add url to the Dataspecer backend
9. `> npm run build:watch`
10. open your localhost at 3000
11. to see changes in code do:
   1.  from root run `> cd packages/wikidata-experimental-feature`
   2.  `> npm run build:watch` simultaneously with 7. command inside client.
   3.  to build queries run `> npm run prebuild` and then again `> npm run build:watch`