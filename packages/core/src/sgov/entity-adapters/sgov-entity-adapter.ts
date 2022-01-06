import {RdfObject, RdfSourceWrap} from "../../core/adapter/rdf";
import {PimResource} from "../../pim/model";
import {LanguageString} from "../../core";
import {SKOS} from "../sgov-vocabulary";
import {IriProvider} from "../../cim";

export async function loadSgovEntityToResource(
  entity: RdfSourceWrap, idProvider: IriProvider, resource: PimResource,
): Promise<void> {
  const prefLabel = await entity.property(SKOS.prefLabel);
  resource.pimHumanLabel = rdfObjectsToLanguageString(prefLabel);
  const definition = await entity.property(SKOS.definition);
  resource.pimHumanDescription = rdfObjectsToLanguageString(definition);
  resource.pimInterpretation = entity.iri;
  resource.iri = idProvider.cimToPim(resource.pimInterpretation);
}

function rdfObjectsToLanguageString(objects: RdfObject[]): LanguageString {
  return Object.fromEntries(objects.map(o => [o.language, o.value]));
}
