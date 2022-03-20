import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {PimAssociation, PimAssociationEnd, PimAttribute, PimClass, PimResource} from "@model-driven-data/core/pim/model";
import {DataPsmCreateAssociationEnd, DataPsmCreateAttribute, DataPsmCreateClass} from "@model-driven-data/core/data-psm/operation";
import {PimCreateAssociation, PimCreateAttribute, PimSetCardinality, PimSetExtends} from "@model-driven-data/core/pim/operation";
import {ComplexOperation} from "@model-driven-data/federated-observable-store/complex-operation";
import {copyPimPropertiesFromResourceToOperation} from "./helper/copyPimPropertiesFromResourceToOperation";
import {selectLanguage} from "../utils/selectLanguage";
import {removeDiacritics} from "../utils/remove-diacritics";
import {createPimClassIfMissing} from "./helper/pim";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

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
    public labelRules: {
        languages: string[],
        namingConvention: "camelCase" | "PascalCase" | "kebab-case" | "snake_case",
        specialCharacters: "allow" | "remove-diacritics" | "remove-all",
    } | null = null;

    private readonly forDataPsmClass: DataPsmClass;
    private readonly sourcePimModel: CoreResourceReader;
    private readonly resourcesToAdd: [string, AssociationOrientation][];
    private store!: FederatedObservableStore;

    /**
     * @param forDataPsmClass
     * @param sourcePimModel
     * @param resourcesToAdd true - the edge is outgoing (from source to this resource)
     */
    constructor(forDataPsmClass: DataPsmClass, sourcePimModel: CoreResourceReader, resourcesToAdd: [string, boolean][]) {
        this.forDataPsmClass = forDataPsmClass;
        this.sourcePimModel = sourcePimModel;
        this.resourcesToAdd = resourcesToAdd;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    async execute(): Promise<void> {
        const interpretedPimClass = await this.store.readResource(this.forDataPsmClass.dataPsmInterpretation as string) as PimClass;

        const pimSchema = this.store.getSchemaForResource(this.forDataPsmClass.dataPsmInterpretation as string) as string;
        const dataPsmSchema = this.store.getSchemaForResource(this.forDataPsmClass.iri as string) as string;

        let correspondingSourcePimClass: PimClass | null = null;
        let allResources = await this.sourcePimModel.listResources();
        for (const iri of allResources) {
            const resource = await this.sourcePimModel.readResource(iri);
            if (PimClass.is(resource) && resource.pimInterpretation === interpretedPimClass.pimInterpretation) {
                correspondingSourcePimClass = resource;
                break;
            }
        }

        for (const [resourceIri, orientation] of this.resourcesToAdd) {
            const resource = await this.sourcePimModel.readResource(resourceIri);
            if (PimAttribute.is(resource)) {
                console.assert(orientation, `Attribute ${resourceIri} should not have a reverse orientation.`);
                await this.processAttribute(resource, pimSchema, dataPsmSchema, correspondingSourcePimClass as PimClass);
            }
            if (PimAssociation.is(resource)) {
                await this.processAssociation(resource, orientation, pimSchema, dataPsmSchema, correspondingSourcePimClass as PimClass);
            }
        }
    }

    private getTechnicalLabelFromPim(pimResource: PimResource): string | undefined {
        if (this.labelRules === null) return undefined;

        let text = selectLanguage(pimResource.pimHumanLabel ?? {}, this.labelRules.languages);

        if (text === undefined) return undefined;

        switch (this.labelRules.specialCharacters) {
            case "remove-all":
                text = removeDiacritics(text);
                text = text.replace(/[^a-zA-Z0-9-_\s]/g, "");
                break;
            case "remove-diacritics":
                text = removeDiacritics(text);
        }

        const lowercaseWords = text.replace(/\s+/g, " ").split(" ").map(w => w.toLowerCase());

        switch (this.labelRules.namingConvention) {
            case "snake_case": text = lowercaseWords.join("_"); break
            case "kebab-case": text = lowercaseWords.join("-"); break
            case "camelCase": text = lowercaseWords.map((w, index) => index > 0 ? w[0].toUpperCase() + w.substring(1) : w).join(""); break
            case "PascalCase": text = lowercaseWords.map(w => w[0].toUpperCase()).join(""); break
        }

        return text;
    }

    private async processAttribute(
        attribute: PimAttribute,
        pimSchema: string,
        dataPsmSchema: string,
        correspondingSourcePimClass: PimClass, // "parent" PIM class
    ) {
        const ownerClass = await this.sourcePimModel.readResource(attribute.pimOwnerClass as string) as PimClass;
        await this.createExtendsHierarchyFromTo(correspondingSourcePimClass, ownerClass, pimSchema);

        const pimAttributeIri = await this.createPimAttributeIfMissing(attribute, pimSchema);

        // PSM attribute

        const dataPsmCreateAttribute = new DataPsmCreateAttribute();
        dataPsmCreateAttribute.dataPsmInterpretation = pimAttributeIri;
        dataPsmCreateAttribute.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAttribute.dataPsmTechnicalLabel = this.getTechnicalLabelFromPim(attribute) ?? null;
        await this.store.applyOperation(dataPsmSchema, dataPsmCreateAttribute);
    }

    private async processAssociation(
        association: PimAssociation,
        orientation: AssociationOrientation, // true if outgoing
        pimSchema: string,
        dataPsmSchema: string,
        correspondingSourcePimClass: PimClass, // "parent" PIM class
    ) {
        const domainAssociationEnd = await this.sourcePimModel.readResource(association.pimEnd[0]) as PimAssociationEnd;
        const domainAssociationEndClass = await this.sourcePimModel.readResource(domainAssociationEnd.pimPart as string) as PimClass;
        const rangeAssociationEnd = await this.sourcePimModel.readResource(association.pimEnd[1]) as PimAssociationEnd;
        const rangeAssociationEndClass = await this.sourcePimModel.readResource(rangeAssociationEnd.pimPart as string) as PimClass;

        const thisAssociationEndClass = orientation ? domainAssociationEndClass : rangeAssociationEndClass;
        const otherAssociationEndClass = orientation ? rangeAssociationEndClass : domainAssociationEndClass;

        // Because the domain class may be a parent of the current class, we need to extend the current class to the parent and create parent itself
        await this.createExtendsHierarchyFromTo(correspondingSourcePimClass, thisAssociationEndClass, pimSchema);

        // Pim other class is created always. Mainly because of the association on PIM level.
        const pimOtherClassIri = await createPimClassIfMissing(otherAssociationEndClass, pimSchema, this.store);

        // Data PSM the other class

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimOtherClassIri;
        dataPsmCreateClass.dataPsmTechnicalLabel = this.getTechnicalLabelFromPim(otherAssociationEndClass) ?? null;
        const dataPsmCreateClassResult = await this.store.applyOperation(dataPsmSchema, dataPsmCreateClass);
        const psmEndRefersToIri = dataPsmCreateClassResult.created[0];

        const {associationEnds} = await this.createPimAssociationIfMissing(association, pimSchema);

        // Data PSM association end

        const dataPsmCreateAssociationEnd = new DataPsmCreateAssociationEnd();
        dataPsmCreateAssociationEnd.dataPsmInterpretation = associationEnds[orientation ? 1 : 0] as string;
        dataPsmCreateAssociationEnd.dataPsmPart = psmEndRefersToIri;
        dataPsmCreateAssociationEnd.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAssociationEnd.dataPsmTechnicalLabel = this.getTechnicalLabelFromPim(association) ?? null;
        await this.store.applyOperation(dataPsmSchema, dataPsmCreateAssociationEnd);
    }

    private async createPimAttributeIfMissing(
        resource: PimAttribute,
        pimSchema: string,
    ): Promise<string> {
        const existingPimIri = await this.store.getPimHavingInterpretation(resource.pimInterpretation as string, pimSchema);

        if (existingPimIri) {
            // todo it does not perform any checks
            return existingPimIri;
        }

        const ownerClassSource = await this.sourcePimModel.readResource(resource.pimOwnerClass as string) as PimClass;
        const ownerClassIri = await this.store.getPimHavingInterpretation(ownerClassSource.pimInterpretation as string, pimSchema);
        if (ownerClassIri === null) {
            throw new Error('Unable to create PimAttribute because its ownerClass has no representative in the PIM store.');
        }

        const pimCreateAttribute = new PimCreateAttribute();
        copyPimPropertiesFromResourceToOperation(resource, pimCreateAttribute);
        pimCreateAttribute.pimOwnerClass = ownerClassIri;
        pimCreateAttribute.pimCardinalityMin = resource.pimCardinalityMin;
        pimCreateAttribute.pimCardinalityMax = resource.pimCardinalityMax;
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
        resource: PimAssociation,
        pimSchema: string,
    ): Promise<{
        associationIri: string,
        associationEnds: string[]
    }> {
        const existingPimIri = await this.store.getPimHavingInterpretation(resource.pimInterpretation as string, pimSchema);

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
        for (const endIri of resource.pimEnd) {
            const endPim = await this.sourcePimModel.readResource(endIri) as PimAssociationEnd;
            const endClass = await this.sourcePimModel.readResource(endPim.pimPart as string) as PimClass;
            const localPimIri = await this.store.getPimHavingInterpretation(endClass.pimInterpretation as string, pimSchema);
            if (localPimIri === null) {
                throw new Error('Unable to create PimAssociation because its end has no representative in the PIM store.');
            }
            pimEndIris.push(localPimIri);
            pimEnds.push(endPim);
        }

        const pimCreateAssociation = new PimCreateAssociation(); // This operation creates AssociationEnds as well
        copyPimPropertiesFromResourceToOperation(resource, pimCreateAssociation);
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

    /**
     * This function creates all necessary PIM classes in a way that there will be correct extends hierarchy between
     * more generic class represented by {@param toClass} and more specific class represented by {@param fromClass}.
     *
     * Returns true if the path was found
     * @param fromClass
     * @param toClass
     * @param pimSchema
     * @private
     */
    private async createExtendsHierarchyFromTo(
        fromClass: PimClass,
        toClass: PimClass,
        pimSchema: string,
    ): Promise<boolean> {
        // Find all classes which needs to be created or checked in order from most generic to most specific.
        const classesToProcess: string[] = [];

        // DFS that finds a SINGLE (random, if multiple exists) path
        const traverseFunction = async (currentClass: PimClass, path: Set<string> = new Set()): Promise<boolean> => {
            let success = currentClass.iri === toClass.iri;

            if (currentClass !== toClass) {
                path.add(currentClass.iri as string);
                for (const ext of currentClass.pimExtends) {
                    const extClass = await this.sourcePimModel.readResource(ext) as PimClass;
                    if (path.has(extClass.iri as string)) {
                        continue
                    }
                    if (await traverseFunction(extClass, path)) {
                        success = true;
                        break;
                    }
                }
                path.delete(currentClass.iri as string);
            }

            if (success) {
                classesToProcess.push(currentClass.iri as string);
            }
            return success;
        }

        const success = await traverseFunction(fromClass);

        // Create each class and fix its extends
        let parentClassInChain: PimClass | null = null; // This is the parent class of the current one from the CIM
        let parentLocalClassInChain: PimClass | null = null; // Patent of the current one but from the local store
        for (const classToProcessIri of classesToProcess) {
            const classToProcess = await this.sourcePimModel.readResource(classToProcessIri) as PimClass;

            const iri = await createPimClassIfMissing(classToProcess, pimSchema, this.store);
            const localClass = await this.store.readResource(iri) as PimClass;

            if (parentClassInChain &&
              !classToProcess.pimExtends.includes(parentClassInChain?.iri as string)) {
                throw new Error(`Assert error in AddClassSurroundings: class in chain does not extend parent class.`);
            }

            const missingExtends = parentLocalClassInChain && !localClass.pimExtends.includes(parentLocalClassInChain.iri as string);
            if (missingExtends) {
                const pimSetExtends = new PimSetExtends();
                pimSetExtends.pimResource = iri;
                pimSetExtends.pimExtends = [...localClass.pimExtends, (parentLocalClassInChain as PimClass).iri as string];
                await this.store.applyOperation(pimSchema, pimSetExtends);
            }

            parentClassInChain = classToProcess;
            parentLocalClassInChain = localClass;
        }

        return success;
    }
}
