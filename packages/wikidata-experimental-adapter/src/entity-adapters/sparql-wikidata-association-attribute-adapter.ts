import { RdfSource, RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimAssociation, PimAssociationEnd, PimAttribute } from "@dataspecer/core/pim/model";
import { loadWikidataEntityToResource } from "./sparql-wikidata-entity-adapter";
import { RDFS, WIKIBASE, WIKIDATA } from "../vocabulary";
import { IriProvider } from "@dataspecer/core/cim";
import { CoreResource } from "@dataspecer/core/core";

async function isWikidataOutwardAssociation(
  entity: RdfSourceWrap
): Promise<boolean> {
    return (await entity.types()).includes(WIKIDATA.valueTypeConstraint);
}

async function isWikidataInwardAssociation(
    entity: RdfSourceWrap
): Promise<boolean> {
    return (await entity.types()).includes(WIKIDATA.subjectTypeConstraint);
}

async function isAssociationFakeAttribute(
    entity: RdfSourceWrap
): Promise<boolean> {
     return (await entity.node(WIKIBASE.propertyType)) !== WIKIBASE.wikibaseItem;
}


export async function loadWikidataAssociationOrAttribute(
  rootCimIri: string,
  entity: RdfSourceWrap,
  source: RdfSource,
  idProvider: IriProvider
): Promise<[CoreResource[], string[]]> {
    
    if (await isAssociationFakeAttribute(entity)) {
      const pimAttribute = await loadWikidataFakeAttribute(rootCimIri, entity, idProvider);
      return [[pimAttribute],[]];
    }
    
    let coreResources: CoreResource[] = [];
    let newClassesIris: string[] = [];
    if (await isWikidataOutwardAssociation(entity)) {
      const possibleObjects = await entity.property(RDFS.range);
      possibleObjects.forEach(async (o) => {
          coreResources.push(...(await loadWikidataAssociation("out", rootCimIri, o.value, entity, idProvider)))
          newClassesIris.push(o.value);
        }
      );
    }
    
    return [coreResources, newClassesIris];
}

async function loadWikidataAssociation(
  inOrOut: "in" | "out",
  startIri: string,
  endIri: string,
  entityAssociation: RdfSourceWrap,
  idProvider: IriProvider
): Promise<[PimAssociationEnd, PimAssociation, PimAssociationEnd]> {
  const mediates1 = new PimAssociationEnd();
  mediates1.iri = idProvider.cimToPim(entityAssociation.iri + "#end-1-" + inOrOut + "-" + getLastPartOfIri(startIri) + "-" + getLastPartOfIri(endIri));
  mediates1.pimPart = idProvider.cimToPim(startIri);

  const mediates2 = new PimAssociationEnd();
  mediates2.iri = idProvider.cimToPim(entityAssociation.iri + "#end-2-" + inOrOut + "-" + getLastPartOfIri(startIri) + "-" + getLastPartOfIri(endIri));
  mediates2.pimPart = idProvider.cimToPim(endIri);

  const association = new PimAssociation();
  await loadWikidataEntityToResource(entityAssociation, idProvider, association);
  association.iri += "#edge-" + inOrOut + "-" + getLastPartOfIri(startIri) + "-" + getLastPartOfIri(endIri);
  association.pimIsOriented = true;
  association.pimEnd = [mediates1.iri, mediates2.iri];
  
  return [mediates1, association, mediates2];
}

async function loadWikidataFakeAttribute(
  rootCimIri: string,
  entity: RdfSourceWrap,
  idProvider: IriProvider
): Promise<PimAttribute> {
  const result = new PimAttribute();
  await loadWikidataEntityToResource(entity, idProvider, result);
  result.iri += "#fake-attribute-" + getLastPartOfIri(rootCimIri);
  result.pimOwnerClass = idProvider.cimToPim(rootCimIri);
  return result;
}

function getLastPartOfIri(iri: string): string {
  return iri.split("/").pop();
}