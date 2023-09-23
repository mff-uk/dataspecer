import {Entity} from "../../entity-model";

export function searchQuery(search: string) {
    return "search:" + search;
}

export function classSurroundingsQuery(iri: string) {
    return "surroundings:" + iri;
}

export function classQuery(iri: string) {
    return "class:" + iri;
}

export interface SearchQueryEntity extends Entity {
    /**
     * Order of found classes
     */
    order: string[];
}