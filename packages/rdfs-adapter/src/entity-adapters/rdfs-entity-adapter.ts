import { RdfObject, RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimResource } from "@dataspecer/core/pim/model";
import { LanguageString } from "@dataspecer/core/core";
import { IriProvider } from "@dataspecer/core/cim";

export async function loadRdfsEntityToResource(
    entity: RdfSourceWrap,
    idProvider: IriProvider,
    resource: PimResource
): Promise<void> {
    const label = await entity.property("http://www.w3.org/2000/01/rdf-schema#label");
    resource.pimHumanLabel = rdfObjectsToLanguageString(label);

    const comment = await entity.property("http://www.w3.org/2000/01/rdf-schema#comment");
    resource.pimHumanDescription = rdfObjectsToLanguageString(comment);

    resource.pimInterpretation = entity.iri;
    resource.iri = idProvider.cimToPim(resource.pimInterpretation);
}

function rdfObjectsToLanguageString(objects: RdfObject[]): LanguageString {
    return Object.fromEntries(objects.map((o) => [!o.language ? "en" : o.language, o.value]));
}
