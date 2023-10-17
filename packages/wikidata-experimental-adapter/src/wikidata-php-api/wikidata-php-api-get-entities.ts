import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { WikidataItemPhpWrap } from "../entity-adapters/php-api-wikidata-entity-adapter";

const WIKIDATA_PHP_API_GET_ENTITIES_URL: string = "https://www.wikidata.org/w/api.php?action=wbgetentities&languages=en&format=json&origin=*&props=labels|descriptions|claims|datatype";

export async function WikidataPhpGetEntities(httpFetch: HttpFetch, cimIris: string[]): Promise<WikidataItemPhpWrap[]> {
    let results: WikidataItemPhpWrap[] = [];
    let classesToQuery: string[] = []
    for await (const [i, cimIri] of cimIris.entries()) {
        classesToQuery.push(cimIri);
        if (classesToQuery.length === 49 || i + 1 === cimIris.length) {
            results.push(...(await WikidataPhpGetEntitiesFetch49(httpFetch, classesToQuery)));
            classesToQuery = [];
        }   
    }
    return results;
}

async function WikidataPhpGetEntitiesFetch49(httpFetch: HttpFetch, cimIris: string[]): Promise<WikidataItemPhpWrap[]> {
    const idsList: string = constructIdsList(cimIris);
    const url: string = WIKIDATA_PHP_API_GET_ENTITIES_URL + "&ids=" + idsList;
    const result = await (await httpFetch(url)).json() as object;
    return (flattenGetEntitiesResponse(result)).map((e) => new WikidataItemPhpWrap(e));
}

function flattenGetEntitiesResponse(responseJson: object): object[] {
    let items: object[] = [];
    for (const [key, value] of Object.entries(responseJson['entities'])) {
        items.push((value) as object);
    }
    return items;
}

function constructIdsList(cimIris: string[]): string {
    return cimIris.map(getLastPartOfIri).join('|');
}

function getLastPartOfIri(iri: string): string {
    return iri.split("/").pop();
}

