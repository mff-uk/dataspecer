import {RdfMemorySourceWrap, RdfObject} from "@dataspecer/core/core/adapter/rdf";
import {PimResource} from "@dataspecer/core/pim/model";
import {LanguageString} from "@dataspecer/core/core";
import {IriProvider} from "@dataspecer/core/cim";

export function loadRdfsEntityToResource(
    entity: RdfMemorySourceWrap,
    idProvider: IriProvider,
    resource: PimResource
) {
    const label = entity.property("http://www.w3.org/2000/01/rdf-schema#label");
    resource.pimHumanLabel = rdfObjectsToLanguageString(label);

    const comment = entity.property("http://www.w3.org/2000/01/rdf-schema#comment");
    resource.pimHumanDescription = rdfObjectsToLanguageString(comment);

    resource.pimInterpretation = entity.iri;
    resource.iri = idProvider.cimToPim(resource.pimInterpretation);
}

// todo use helper function in core
function rdfObjectsToLanguageString(objects: RdfObject[]): LanguageString {
    return Object.fromEntries(objects.map((o) => [!o.language ? "en" : o.language, o.value]));
}
