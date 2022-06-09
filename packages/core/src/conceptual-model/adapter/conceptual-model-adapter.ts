import { assert, CoreResourceReader } from "../../core";
import {
  ConceptualModel,
  ConceptualModelClass,
  ConceptualModelProperty,
  ConceptualModelComplexType,
  ConceptualModelPrimitiveType,
} from "../model";
import {
  PimAssociation,
  PimAssociationEnd,
  PimAttribute,
  PimClass,
  PimSchema,
} from "../../pim/model";

class ConceptualModelAdapter {
  private readonly reader: CoreResourceReader;

  private readonly classes: { [iri: string]: ConceptualModelClass } = {};

  constructor(reader: CoreResourceReader) {
    this.reader = reader;
  }

  async load(pimSchemaIri: string): Promise<ConceptualModel | null> {
    const pimSchema = await this.reader.readResource(pimSchemaIri);
    if (!PimSchema.is(pimSchema)) {
      return null;
    }
    const result = new ConceptualModel();
    this.pimSchemaToModel(pimSchema, result);
    for (const iri of pimSchema.pimParts) {
      await this.loadPimPart(iri);
    }
    result.classes = { ...this.classes };
    return result;
  }

  private pimSchemaToModel(schemaData: PimSchema, model: ConceptualModel) {
    model.pimIri = schemaData.iri;
    model.humanLabel = schemaData.pimHumanLabel;
    model.humanDescription = schemaData.pimHumanDescription;
  }

  private async loadPimPart(partIri: string) {
    const part = await this.reader.readResource(partIri);
    let isKnown = false;
    if (PimAssociation.is(part)) {
      await this.loadPimAssociation(part);
      isKnown = true;
    }
    if (PimAssociationEnd.is(part)) {
      // We do not load them directly but using the association.
      isKnown = true;
    }
    if (PimAttribute.is(part)) {
      await this.loadPimAttribute(part);
      isKnown = true;
    }
    if (PimClass.is(part)) {
      await this.loadPimClass(part);
      isKnown = true;
    }
    if (!isKnown) {
      throw new Error(`Unsupported PIM part entity '${partIri}'.`);
    }
  }

  private async loadPimAssociation(associationData: PimAssociation) {
    const ends: PimAssociationEnd[] = [];
    for (const iri of associationData.pimEnd) {
      const resource = await this.reader.readResource(iri);
      if (PimAssociationEnd.is(resource)) {
        ends.push(resource);
      }
    }
    assert(
      ends.length === 2,
      `Association ${associationData.iri} must have two association ends.`
    );

    // Association can be used in both directions.
    const left: PimAssociationEnd = ends[0];
    const leftClass = this.getClass(left.pimPart);

    const right: PimAssociationEnd = ends[1];
    const rightClass = this.getClass(right.pimPart);

    this.createAssociationEnd(leftClass, rightClass, associationData, right);
    this.createAssociationEnd(rightClass, leftClass, associationData, left, associationData.pimIsOriented);
  }

  private createAssociationEnd(
    source: ConceptualModelClass,
    target: ConceptualModelClass,
    association: PimAssociation,
    associationEnd: PimAssociationEnd,
    isReverse = false,
  ) {
    const property = new ConceptualModelProperty();
    property.pimIri = associationEnd.iri;
    property.cimIri =
      associationEnd.pimInterpretation ?? association.pimInterpretation;
    property.humanLabel =
      associationEnd.pimHumanLabel ?? association.pimHumanLabel;
    property.humanDescription =
      associationEnd.pimHumanDescription ?? association.pimHumanDescription;
    property.cardinalityMin = associationEnd.pimCardinalityMin;
    property.cardinalityMax = associationEnd.pimCardinalityMax;
    property.isReverse = isReverse;

    const type = new ConceptualModelComplexType();
    type.pimClassIri = target.pimIri;
    property.dataTypes.push(type);

    source.properties.push(property);
  }

  private getClass(pimClassIri: string): ConceptualModelClass {
    const result = this.classes[pimClassIri];
    if (result) {
      return result;
    }
    {
      const newClass = new ConceptualModelClass();
      newClass.pimIri = pimClassIri;
      this.classes[pimClassIri] = newClass;
      return newClass;
    }
  }

  private async loadPimAttribute(attributeData: PimAttribute) {
    const model = new ConceptualModelProperty();
    model.pimIri = attributeData.iri;
    model.cimIri = attributeData.pimInterpretation;
    model.humanLabel = attributeData.pimHumanLabel;
    model.humanDescription = attributeData.pimHumanDescription;
    model.cardinalityMin = attributeData.pimCardinalityMin;
    model.cardinalityMax = attributeData.pimCardinalityMax;

    if (attributeData.pimDatatype !== null) {
      const type = new ConceptualModelPrimitiveType();
      type.dataType = attributeData.pimDatatype;
      model.dataTypes.push(type);
    }

    const owner = this.getClass(attributeData.pimOwnerClass);
    owner.properties.push(model);
  }

  private loadPimClass(classData: PimClass) {
    const model = this.getClass(classData.iri);
    model.pimIri = classData.iri;
    model.cimIri = classData.pimInterpretation;
    model.humanLabel = classData.pimHumanLabel;
    model.humanDescription = classData.pimHumanDescription;
    model.isCodelist = classData.pimIsCodelist;
    model.codelistUrl = classData.pimCodelistUrl;
    model.extends = classData.pimExtends.map((iri) => this.getClass(iri));
  }
}

export async function coreResourcesToConceptualModel(
  reader: CoreResourceReader,
  pimSchemaIri: string
): Promise<ConceptualModel | null> {
  const adapter = new ConceptualModelAdapter(reader);
  return await adapter.load(pimSchemaIri);
}
