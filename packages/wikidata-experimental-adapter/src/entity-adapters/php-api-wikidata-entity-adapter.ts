import { LanguageString } from "@dataspecer/core/core";
import { WIKIDATA, WIKIDATA_ENTITY_PREFIX } from "../vocabulary";
import { PimClass, PimResource } from "@dataspecer/core/pim/model";
import { IriProvider } from "@dataspecer/core/cim";

type WikidataLanguageValue = {
    language: string;
    value: string;
}

type WikidataLanguageObject = Record<string, WikidataLanguageValue>; 

type WikidataMainSnakEntityValue = {
    value: {
        id: string;
    }
}
 
type WikidataMainSnak = {
    datavalue: WikidataMainSnakEntityValue;
}

type WikidataSnak = {
    mainsnak: WikidataMainSnak;
}

type WikidataClaims = Record<string, WikidataSnak[]>;

export class WikidataItemPhpWrap {
    wikidataJsonObject: object;

    constructor(wikiwikidataJsonObject: object) {
        this.wikidataJsonObject = wikiwikidataJsonObject;
    }

    getIri(): string {
        return WIKIDATA_ENTITY_PREFIX + this.wikidataJsonObject['id'];
    }

    getEntityType(): string {
        return this.wikidataJsonObject['type'];
    }

    getParents(): string[] {
        let parentsIris: string[] = [];
        if ('claims' in this.wikidataJsonObject) {
            const claims = this.wikidataJsonObject['claims'] as WikidataClaims;
            const subclassOfProperty = this.getLastPartOfIri(WIKIDATA.subclassOf);
            if (subclassOfProperty in claims) {
                const parentsSnaks = claims[subclassOfProperty];
                parentsSnaks.forEach((snak) => {
                    parentsIris.push(WIKIDATA_ENTITY_PREFIX + snak.mainsnak.datavalue.value.id);
                });
            }
        }
        return parentsIris;
    }

    getDescriptions(): LanguageString {
        if ('descriptions' in this.wikidataJsonObject) {
            return this.convertWikidataLanguageObjectToLanguageStrings(this.wikidataJsonObject['descriptions'] as WikidataLanguageObject);
        }
        return {};
    }

    getLabels(): LanguageString {
        if ('labels' in this.wikidataJsonObject) {
            return this.convertWikidataLanguageObjectToLanguageStrings(this.wikidataJsonObject['labels'] as WikidataLanguageObject);
        }
        return {};
    }

    private convertWikidataLanguageObjectToLanguageStrings(wlo: WikidataLanguageObject): LanguageString {
        return Object.fromEntries(Object.entries(wlo).map((o) => [o[1].language, o[1].value]));
    }

    private getLastPartOfIri(iri: string): string {
        return iri.split("/").pop();
    }
    
}

export async function loadWikidataEntityFromPhpWrapToResource(entity: WikidataItemPhpWrap, idProvider: IriProvider, resource: PimResource): Promise<void> {
    resource.pimInterpretation = entity.getIri();
    resource.iri = idProvider.cimToPim(entity.getIri());
    resource.pimHumanDescription = entity.getDescriptions();
    resource.pimHumanLabel = entity.getLabels();
}
 