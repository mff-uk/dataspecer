import { LDkitGenerator } from "@dataspecer/ldkit";

/**
 * Returns all artefact generators that will be used in the application.
 * This is the place to register your own artefact generators if you need to.
 */
export function getArtefactGenerators() {
    return [
        new LDkitGenerator(),
    ];
}
