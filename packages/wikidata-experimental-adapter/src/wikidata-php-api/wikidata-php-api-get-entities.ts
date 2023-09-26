import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";


const WIKIDATA_PHP_API_GET_ENTITIES_URL: string = "https://www.wikidata.org/w/api.php?action=wbgetentities&languages=en&format=json&origin=*&props=labels|descriptions|claims|datatype";

export async function WikidataPhpGetEntities(httpFetch: HttpFetch, cimIris: string[]): Promise<Object[]> {
    let results: Object[] = [];

    let classesToQuery: string[] = []
    for (let i = 0; i < cimIris.length; i += 1) {
        classesToQuery.push(cimIris[i]);
        if (classesToQuery.length === 49 || i + 1 === cimIris.length) {
            results.push(...(await WikidataPhpGetEntitiesFetch49(httpFetch, classesToQuery)));
            classesToQuery = [];
        }   
    }

    console.log(results);
    return [];
}

async function WikidataPhpGetEntitiesFetch49(httpFetch: HttpFetch, cimIris: string[]): Promise<Object[]> {
    const idsList: string = constructIdsList(cimIris);
    const url: string = WIKIDATA_PHP_API_GET_ENTITIES_URL + "&ids=" + idsList;
    const result = await (await httpFetch(url)).json();
    return flattenGetEntitiesResponse(result);
}

function flattenGetEntitiesResponse(responseJson: Object): Object[] {
    let items: Object[] = [];
    for (const [key, value] of Object.entries(responseJson['entities'])) {
        items.push(value);
    }
    return items;
}

function constructIdsList(cimIris: string[]): string {
    return cimIris.map(getLastPartOfIri).join('|');
}

function getLastPartOfIri(iri: string): string {
    return iri.split("/").pop();
  }