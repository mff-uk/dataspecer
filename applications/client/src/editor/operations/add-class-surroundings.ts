import { isSemanticModelClass, isSemanticModelRelationPrimitive, isSemanticModelRelationship, SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmClass } from "@dataspecer/core/data-psm/model";
import { DataPsmCreateAssociationEnd, DataPsmCreateAttribute, DataPsmCreateClass } from "@dataspecer/core/data-psm/operation";
import { PimAssociation, PimAssociationEnd, PimAttribute, PimClass, PimResource } from "@dataspecer/core/pim/model";
import { PimCreateAssociation, PimCreateAttribute, PimSetCardinality } from "@dataspecer/core/pim/operation";
import { OFN, XSD } from '@dataspecer/core/well-known';
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { TechnicalLabelOperationContext } from "./context/technical-label-operation-context";
import { copyPimPropertiesFromResourceToOperation } from "./helper/copyPimPropertiesFromResourceToOperation";
import { createPimClassIfMissing } from "./helper/pim";
import { extendPimClassesAlongInheritance } from "./helper/extend-pim-classes-along-inheritance";

/**
 * For now, this represents simple mapping between different primitive types used in application.
 */
const PRIMITIVE_TYPE_MAPPING: Record<string, string> = {
    [XSD.boolean]: OFN.boolean,
    [XSD.date]: OFN.date,
    [XSD.time]: OFN.time,
    [XSD.dateTimeStamp]: OFN.dateTime,
    [XSD.integer]: OFN.integer,
    [XSD.decimal]: OFN.decimal,
    [XSD.anyURI]: OFN.url,
    [XSD.string]: OFN.string,
    // [XSD.]: OFN.text,
    // [XSD.]: OFN.rdfLangString,
};

/**
 * true - the resource is a range, false - the resource is a domain
 * Represents an orientation of the association which will be added to the resource. Because the associations may link
 * the resource with itself, we need to distinguish this two types of association.
 */
export type AssociationOrientation = boolean;

/**
 * With each association, the direction of the association must be specified. Suppose we have class Person representing
 * human beings. We also have class Barber, which clearly is a Person. Between Person and Barber, there is an
 * association that Person has a Barber. Because Barber can also have a Barber, the orientation of the association need
 * to be specified, whether we want to join Barber's Barber, or all Barbers going to the Barber.
 *
 * @todo Associations and attributes that belongs to inherited class (not the source class itself) are linked to the
 *     source class. Therefore all the inheritance is flattened.
 */
export class AddClassSurroundings implements ComplexOperation {
    private readonly forDataPsmClass: DataPsmClass;
    private readonly sourceSemanticModel: SemanticModelEntity[];
    private readonly resourcesToAdd: [string, AssociationOrientation][];
    private store!: FederatedObservableStore;
    private context: TechnicalLabelOperationContext|null = null;

    /**
     * @param forDataPsmClass
     * @param sourceSemanticModel
     * @param resourcesToAdd true - the edge is outgoing (from source to this resource)
     */
    constructor(forDataPsmClass: DataPsmClass, sourceSemanticModel: SemanticModelEntity[], resourcesToAdd: [string, boolean][]) {
        this.forDataPsmClass = forDataPsmClass;
        this.sourceSemanticModel = sourceSemanticModel;
        this.resourcesToAdd = resourcesToAdd;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    setContext(context: TechnicalLabelOperationContext) {
        this.context = context;
    }

    async execute(): Promise<void> {
        const interpretedPimClass = await this.store.readResource(this.forDataPsmClass.dataPsmInterpretation as string) as PimClass;

        const pimSchema = this.store.getSchemaForResource(this.forDataPsmClass.dataPsmInterpretation as string) as string;
        const dataPsmSchema = this.store.getSchemaForResource(this.forDataPsmClass.iri as string) as string;

        let correspondingSourcePimClass: SemanticModelClass | null = null;
        for (const resource of this.sourceSemanticModel) {
            if (isSemanticModelClass(resource) && resource.id === interpretedPimClass.pimInterpretation) {
                correspondingSourcePimClass = resource;
                break;
            }
        }

        // console.log(correspondingSourcePimClass);
        // console.log(this.sourceSemanticModel);
        // console.log(this.resourcesToAdd);

        for (const [resourceIri, orientation] of this.resourcesToAdd) {
            const resource = this.sourceSemanticModel.find(r => r.id === resourceIri);
            if (isSemanticModelRelationship(resource)) {
                if (isSemanticModelRelationPrimitive(resource)) {
                    console.assert(orientation, `Attribute ${resourceIri} should not have a reverse orientation.`);
                    await this.processAttribute(resource, pimSchema, dataPsmSchema, correspondingSourcePimClass!);
                } else {
                    await this.processAssociation(resource, orientation, pimSchema, dataPsmSchema, correspondingSourcePimClass!);
                }
            }
        }
    }

    /**
     * todo: There would be no specific difference between an attribute and association.
     */
    private async processAttribute(
        attribute: SemanticModelRelationship,
        pimSchema: string,
        dataPsmSchema: string,
        correspondingSourcePimClass: SemanticModelClass,
    ) {
        const ownerClass = this.sourceSemanticModel.find(e => e.id === attribute.ends[0].concept) as SemanticModelClass;
        await extendPimClassesAlongInheritance(
            correspondingSourcePimClass, ownerClass, pimSchema, this.store, this.sourceSemanticModel);

        const pimAttributeIri = await this.createPimAttributeIfMissing(attribute, pimSchema);

        // PSM attribute

        const dataPsmCreateAttribute = new DataPsmCreateAttribute();
        dataPsmCreateAttribute.dataPsmInterpretation = pimAttributeIri;
        dataPsmCreateAttribute.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAttribute.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(await this.store.readResource(pimAttributeIri) as PimResource) ?? null;
        dataPsmCreateAttribute.dataPsmDatatype = (await this.store.readResource(pimAttributeIri) as PimAttribute).pimDatatype;
        await this.store.applyOperation(dataPsmSchema, dataPsmCreateAttribute);
    }

    private async processAssociation(
        association: SemanticModelRelationship,
        orientation: AssociationOrientation, // true if outgoing
        pimSchema: string,
        dataPsmSchema: string,
        correspondingSourcePimClass: SemanticModelClass,
    ) {
        const domainAssociationEndClass = this.sourceSemanticModel.find(e => e.id === association.ends[0].concept) as SemanticModelClass;
        const rangeAssociationEndClass = this.sourceSemanticModel.find(e => e.id === association.ends[1].concept) as SemanticModelClass;

        const thisAssociationEndClass = orientation ? domainAssociationEndClass : rangeAssociationEndClass;
        const otherAssociationEndClass = orientation ? rangeAssociationEndClass : domainAssociationEndClass;

        // Because the this class may be a parent of the current class, we need to extend the current class to the parent and create parent itself
        await extendPimClassesAlongInheritance( 
            correspondingSourcePimClass, thisAssociationEndClass, pimSchema, this.store, this.sourceSemanticModel);

        // Pim other class is created always. Mainly because of the association on PIM level.
        const pimOtherClassIri = await createPimClassIfMissing(otherAssociationEndClass, pimSchema, this.store);

        // Data PSM the other class

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimOtherClassIri;
        dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(await this.store.readResource(pimOtherClassIri) as PimClass) ?? null;
        const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClass);
        const psmEndRefersToIri = dataPsmCreateClassResult.created[0];

        const {associationEnds, associationIri} = await this.createPimAssociationIfMissing(association, pimSchema);

        // Data PSM association end

        const dataPsmCreateAssociationEnd = new DataPsmCreateAssociationEnd();
        dataPsmCreateAssociationEnd.dataPsmInterpretation = associationEnds[orientation ? 1 : 0] as string;
        dataPsmCreateAssociationEnd.dataPsmPart = psmEndRefersToIri;
        dataPsmCreateAssociationEnd.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAssociationEnd.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(await this.store.readResource(associationIri) as PimAssociation) ?? null;
        await this.store.applyOperation(dataPsmSchema, dataPsmCreateAssociationEnd);
    }

    private async createPimAttributeIfMissing(
        resource: SemanticModelRelationship,
        pimSchema: string,
    ): Promise<string> {
        const existingPimIri = await this.store.getPimHavingInterpretation(resource.id as string, PimAttribute.TYPE, pimSchema);

        if (existingPimIri) {
            // todo it does not perform any checks
            return existingPimIri;
        }

        const ownerClassSource = await this.sourceSemanticModel.find(e => e.id === resource.ends[0].concept) as SemanticModelClass;
        const ownerClassIri = await this.store.getPimHavingInterpretation(ownerClassSource.id as string, PimClass.TYPE, pimSchema);
        if (ownerClassIri === null) {
            throw new Error('Unable to create PimAttribute because its ownerClass has no representative in the PIM store.');
        }

        const pimCreateAttribute = new PimCreateAttribute();
        copyPimPropertiesFromResourceToOperation(resource, pimCreateAttribute);
        pimCreateAttribute.pimHumanLabel = resource.ends[1].name;
        pimCreateAttribute.pimHumanDescription = resource.ends[1].description;
        pimCreateAttribute.pimOwnerClass = ownerClassIri;
        pimCreateAttribute.pimCardinalityMin = resource.ends[1].cardinality?.[0] ?? 0;
        pimCreateAttribute.pimCardinalityMax = resource.ends[1].cardinality?.[1] ?? null;
        pimCreateAttribute.pimDatatype = PRIMITIVE_TYPE_MAPPING[resource.ends[1].concept] ?? resource.ends[1].concept;
        const pimCreateAttributeResult = await this.store.applyOperation(pimSchema, pimCreateAttribute);
        return pimCreateAttributeResult.created[0];
    }

    /**
     * Takes a current PimResource and creates it in the store if not exists. If it exists, it does not perform any
     * checks, so it supposes the CIM is immutable.
     * @param resource Fresh PimResource to add to the store
     * @param pimSchema
     * @return IRI of PimResource in the store
     */
    private async createPimAssociationIfMissing(
        resource: SemanticModelRelationship,
        pimSchema: string,
    ): Promise<{
        associationIri: string,
        associationEnds: string[]
    }> {
        const existingPimIri = await this.store.getPimHavingInterpretation(resource.id as string, PimAssociation.TYPE, pimSchema);

        if (existingPimIri) {
            // todo it does not perform any checks
            const association = await this.store.readResource(existingPimIri) as PimAssociation;
            return {
                associationIri: existingPimIri,
                associationEnds: association.pimEnd,
            }
        }

        // IRI of local PIM classes from the association ends
        const pimEndIris: string[] = [];
        const pimEnds: PimAssociationEnd[] = [];
        for (const [endNumber, end] of Object.entries(resource.ends)) {
            const associationEnd = new PimAssociationEnd(resource.id + "#end-" + endNumber);
            const endClass = await this.sourceSemanticModel.find(e => e.id === end.concept) as SemanticModelClass;
            const localPimIri = await this.store.getPimHavingInterpretation(endClass.id as string, PimClass.TYPE, pimSchema);
            associationEnd.pimPart = localPimIri;
            associationEnd.pimCardinalityMin = end.cardinality?.[0] ?? 0;
            associationEnd.pimCardinalityMax = end.cardinality?.[1] ?? null;
            if (localPimIri === null) {
                throw new Error('Unable to create PimAssociation because its end has no representative in the PIM store.');
            }
            pimEndIris.push(localPimIri);
            pimEnds.push(associationEnd);
        }

        const pimCreateAssociation = new PimCreateAssociation(); // This operation creates AssociationEnds as well
        copyPimPropertiesFromResourceToOperation(resource, pimCreateAssociation);
        pimCreateAssociation.pimHumanLabel = resource.ends[1].name;
        pimCreateAssociation.pimHumanDescription = resource.ends[1].description;
        pimCreateAssociation.pimIsOriented = true;
        pimCreateAssociation.pimAssociationEnds = pimEndIris;
        const pimCreateAssociationResult = await this.store.applyOperation(pimSchema, pimCreateAssociation);
        const operationResult =  {
            associationIri: pimCreateAssociationResult.created[0],
            associationEnds: pimCreateAssociationResult.created.slice(1)
        }

        // Set cardinalities of association ends if differs
        for (let i = 0; i < operationResult.associationEnds.length; i++) {
            const associationEnd = await this.store.readResource(operationResult.associationEnds[i]) as PimAssociationEnd;

            if (associationEnd.pimCardinalityMin !== pimEnds[i].pimCardinalityMin ||
                associationEnd.pimCardinalityMax !== pimEnds[i].pimCardinalityMax) {

                const pimSetCardinality = new PimSetCardinality();
                pimSetCardinality.pimCardinalityMin = pimEnds[i].pimCardinalityMin;
                pimSetCardinality.pimCardinalityMax = pimEnds[i].pimCardinalityMax;
                pimSetCardinality.pimResource = associationEnd.iri;
                await this.store.applyOperation(pimSchema, pimSetCardinality);
            }
        }

        return operationResult;
    }
}
