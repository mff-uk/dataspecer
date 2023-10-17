import {Entity} from "../../entity-model";

export function searchQuery(search: string) {
    return "search:" + search;
}

export function classSurroundingsQuery(id: string) {
    return "surroundings:" + id;
}

export function classQuery(id: string) {
    return "class:" + id;
}

export interface SearchQueryEntity extends Entity {
    /**
     * Order of found classes
     */
    order: string[];
}