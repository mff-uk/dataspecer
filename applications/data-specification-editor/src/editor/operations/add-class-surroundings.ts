import { isSemanticModelClass, isSemanticModelRelationPrimitive, isSemanticModelRelationship, SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { DataPsmClass } from "@dataspecer/core/data-psm/model";
import { DataPsmCreateAssociationEnd, DataPsmCreateAttribute, DataPsmCreateClass } from "@dataspecer/core/data-psm/operation";
import { OFN, XSD } from '@dataspecer/core/well-known';
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { TechnicalLabelOperationContext } from "./context/technical-label-operation-context";
import { extendPimClassesAlongInheritance } from "./helper/extend-pim-classes-along-inheritance";
import { createPimClassIfMissing } from "./helper/pim";

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
    private readonly forSemanticClass: SemanticModelClass;
    private readonly sourceSemanticModel: SemanticModelEntity[];
    private readonly resourcesToAdd: [string, AssociationOrientation][];
    private store!: FederatedObservableStore;
    private context: TechnicalLabelOperationContext|null = null;

    /**
     * @param forDataPsmClass
     * @param sourceSemanticModel
     * @param resourcesToAdd true - the edge is outgoing (from source to this resource)
     */
    constructor(forDataPsmClass: DataPsmClass, forSemanticClass: SemanticModelClass, sourceSemanticModel: SemanticModelEntity[], resourcesToAdd: [string, boolean][]) {
        this.forDataPsmClass = forDataPsmClass;
        this.forSemanticClass = forSemanticClass;
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
        const pimSchema = this.store.getSchemaForResource(this.forSemanticClass.id) as string;
        const dataPsmSchema = this.store.getSchemaForResource(this.forDataPsmClass.iri as string) as string;

        let correspondingSourcePimClass: SemanticModelClass | null = null;
        for (const resource of this.sourceSemanticModel) {
            if (isSemanticModelClass(resource) && resource.id === this.forSemanticClass.iri) {
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

        const pimAttributeIri = await this.createPimRelationshipIfMissing(attribute, pimSchema);

        // PSM attribute

        const dataPsmCreateAttribute = new DataPsmCreateAttribute();
        dataPsmCreateAttribute.dataPsmInterpretation = pimAttributeIri;
        dataPsmCreateAttribute.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAttribute.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim(attribute.ends[1].name) ?? null;
        dataPsmCreateAttribute.dataPsmDatatype = (await this.store.readResource(pimAttributeIri) as SemanticModelRelationship).ends[1].concept ?? null;
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
        dataPsmCreateClass.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim((await this.store.readResource(pimOtherClassIri) as SemanticModelClass).name) ?? null;
        const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClass);
        const psmEndRefersToIri = dataPsmCreateClassResult.created[0];

        const associationIri = await this.createPimRelationshipIfMissing(association, pimSchema);

        // Data PSM association end

        const dataPsmCreateAssociationEnd = new DataPsmCreateAssociationEnd();
        dataPsmCreateAssociationEnd.dataPsmInterpretation = associationIri;
        dataPsmCreateAssociationEnd.dataPsmPart = psmEndRefersToIri;
        dataPsmCreateAssociationEnd.dataPsmIsReverse = !orientation;
        dataPsmCreateAssociationEnd.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAssociationEnd.dataPsmTechnicalLabel = this.context?.getTechnicalLabelFromPim((await this.store.readResource(associationIri) as SemanticModelRelationship).ends[1].name) ?? null;
        await this.store.applyOperation(dataPsmSchema, dataPsmCreateAssociationEnd);
    }

    private async createPimRelationshipIfMissing(
        resource: SemanticModelRelationship,
        pimSchema: string,
    ): Promise<string> {
        const existingPimIri = await this.store.getPimHavingInterpretation(resource.id as string, "", pimSchema);

        if (existingPimIri) {
            // todo it does not perform any checks
            return existingPimIri;
        }

        const ownerClassSource = this.sourceSemanticModel.find(e => e.id === resource.ends[0].concept) as SemanticModelClass;
        const ownerClassIri = await this.store.getPimHavingInterpretation(ownerClassSource.id as string, "", pimSchema);
        if (ownerClassIri === null) {
            throw new Error('Unable to create PimAttribute because its ownerClass has no representative in the PIM store.');
        }

        const targetClassSource = this.sourceSemanticModel.find(e => e.id === resource.ends[1].concept) as SemanticModelClass;
        const targetClassIri = targetClassSource ? await this.store.getPimHavingInterpretation(targetClassSource.id as string, "", pimSchema) : null;

        const op = createRelationship({
            ends: [
                {
                    iri: resource.ends[0].iri,
                    cardinality: resource.ends[0].cardinality,
                    concept: ownerClassIri,
                    name: resource.ends[0].name,
                    description: resource.ends[0].description,
                },
                {
                    iri: resource.ends[1].iri,
                    cardinality: resource.ends[1].cardinality,
                    concept: PRIMITIVE_TYPE_MAPPING[resource.ends[1].concept] ?? targetClassIri,
                    name: resource.ends[1].name,
                    description: resource.ends[1].description,
                }
            ]
        });
        // @ts-ignore
        const {id} = await this.store.applyOperation(pimSchema, op);
        return id as string;
    }
}
