import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {PimAssociation, PimAssociationEnd, PimAttribute, PimClass, PimResource} from "@model-driven-data/core/pim/model";
import {DataPsmCreateAssociationEnd, DataPsmCreateAttribute, DataPsmCreateClass} from "@model-driven-data/core/data-psm/operation";
import {PimCreateAssociation, PimCreateAttribute, PimSetExtends} from "@model-driven-data/core/pim/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreDescriptor, StoreHavingResourceDescriptor} from "../store/operation-executor";
import {copyPimPropertiesFromResourceToOperation} from "./helper/copyPimPropertiesFromResourceToOperation";
import {selectLanguage} from "../utils/selectLanguage";
import {removeDiacritics} from "../utils/remove-diacritics";
import {createPimClassIfMissing} from "./helper/pim";

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

    async execute(executor: OperationExecutor): Promise<void> {
        const pimStoreSelector = new StoreHavingResourceDescriptor(this.forDataPsmClass.dataPsmInterpretation as string);
        const dataPsmStoreSelector = new StoreHavingResourceDescriptor(this.forDataPsmClass.iri as string);
        const interpretedPimClass = await executor.store.readResource(this.forDataPsmClass.dataPsmInterpretation as string) as PimClass;

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
                await this.processAttribute(resource, executor, pimStoreSelector, dataPsmStoreSelector, correspondingSourcePimClass as PimClass);
            }
            if (PimAssociation.is(resource)) {
                await this.processAssociation(resource, orientation, executor, pimStoreSelector, dataPsmStoreSelector, correspondingSourcePimClass as PimClass);
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
        executor: OperationExecutor,
        pimStoreSelector: StoreDescriptor,
        dataPsmStoreSelector: StoreDescriptor,
        correspondingSourcePimClass: PimClass, // "parent" PIM class
    ) {
        const ownerClass = await this.sourcePimModel.readResource(attribute.pimOwnerClass as string) as PimClass;
        await this.createExtendsHierarchyFromTo(correspondingSourcePimClass, ownerClass, pimStoreSelector, executor);

        const pimAttributeIri = await this.createPimAttributeIfMissing(attribute, pimStoreSelector, executor);

        // PSM attribute

        const dataPsmCreateAttribute = new DataPsmCreateAttribute();
        dataPsmCreateAttribute.dataPsmInterpretation = pimAttributeIri;
        dataPsmCreateAttribute.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAttribute.dataPsmTechnicalLabel = this.getTechnicalLabelFromPim(attribute) ?? null;
        await executor.applyOperation(dataPsmCreateAttribute, dataPsmStoreSelector);
    }

    private async processAssociation(
        association: PimAssociation,
        orientation: AssociationOrientation, // true if outgoing
        executor: OperationExecutor,
        pimStoreSelector: StoreDescriptor,
        dataPsmStoreSelector: StoreDescriptor,
        correspondingSourcePimClass: PimClass, // "parent" PIM class
    ) {
        const domainAssociationEnd = await this.sourcePimModel.readResource(association.pimEnd[0]) as PimAssociationEnd;
        const domainAssociationEndClass = await this.sourcePimModel.readResource(domainAssociationEnd.pimPart as string) as PimClass;
        const rangeAssociationEnd = await this.sourcePimModel.readResource(association.pimEnd[1]) as PimAssociationEnd;
        const rangeAssociationEndClass = await this.sourcePimModel.readResource(rangeAssociationEnd.pimPart as string) as PimClass;

        const thisAssociationEndClass = orientation ? domainAssociationEndClass : rangeAssociationEndClass;
        const otherAssociationEndClass = orientation ? rangeAssociationEndClass : domainAssociationEndClass;

        // Because the domain class may be a parent of the current class, we need to extend the current class to the parent and create parent itself
        await this.createExtendsHierarchyFromTo(correspondingSourcePimClass, thisAssociationEndClass, pimStoreSelector, executor);

        // Pim other class is created always. Mainly because of the association on PIM level.
        const pimOtherClassIri = await createPimClassIfMissing(otherAssociationEndClass, pimStoreSelector, executor);

        // Data PSM the other class

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimOtherClassIri;
        dataPsmCreateClass.dataPsmTechnicalLabel = this.getTechnicalLabelFromPim(thisAssociationEndClass) ?? null;
        const dataPsmCreateClassResult = await executor.applyOperation(dataPsmCreateClass, dataPsmStoreSelector);
        const psmEndRefersToIri = dataPsmCreateClassResult.created[0];

        const {associationEnds} = await this.createPimAssociationIfMissing(association, pimStoreSelector, executor);

        // Data PSM association end

        const dataPsmCreateAssociationEnd = new DataPsmCreateAssociationEnd();
        dataPsmCreateAssociationEnd.dataPsmInterpretation = associationEnds[orientation ? 1 : 0] as string;
        dataPsmCreateAssociationEnd.dataPsmPart = psmEndRefersToIri;
        dataPsmCreateAssociationEnd.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        dataPsmCreateAssociationEnd.dataPsmTechnicalLabel = this.getTechnicalLabelFromPim(association) ?? null;
        await executor.applyOperation(dataPsmCreateAssociationEnd, dataPsmStoreSelector);
    }

    private async createPimAttributeIfMissing(
        resource: PimAttribute,
        pimStoreSelector: StoreDescriptor,
        executor: OperationExecutor,
    ): Promise<string> {
        const existingPimIri = await executor.store.getPimHavingInterpretation(resource.pimInterpretation as string, pimStoreSelector);

        if (existingPimIri) {
            // todo it does not perform any checks
            return existingPimIri;
        }

        const ownerClassSource = await this.sourcePimModel.readResource(resource.pimOwnerClass as string) as PimClass;
        const ownerClassIri = await executor.store.getPimHavingInterpretation(ownerClassSource.pimInterpretation as string, pimStoreSelector);
        if (ownerClassIri === null) {
            throw new Error('Unable to create PimAttribute because its ownerClass has no representative in the PIM store.');
        }

        const pimCreateAttribute = new PimCreateAttribute();
        copyPimPropertiesFromResourceToOperation(resource, pimCreateAttribute);
        pimCreateAttribute.pimOwnerClass = ownerClassIri;
        pimCreateAttribute.pimCardinalityMin = resource.pimCardinalityMin;
        pimCreateAttribute.pimCardinalityMax = resource.pimCardinalityMax;
        const pimCreateAttributeResult = await executor.applyOperation(pimCreateAttribute, pimStoreSelector);
        return pimCreateAttributeResult.created[0];
    }

    /**
     * Takes a current PimResource and creates it in the store if not exists. If it exists, it does not perform any
     * checks, so it supposes the CIM is immutable.
     * @param resource Fresh PimResource to add to the store
     * @param pimStoreSelector
     * @param executor
     * @return IRI of PimResource in the store
     */
    private async createPimAssociationIfMissing(
        resource: PimAssociation,
        pimStoreSelector: StoreDescriptor,
        executor: OperationExecutor,
    ): Promise<{
        associationIri: string,
        associationEnds: string[]
    }> {
        const existingPimIri = await executor.store.getPimHavingInterpretation(resource.pimInterpretation as string, pimStoreSelector);

        if (existingPimIri) {
            // todo it does not perform any checks
            const association = await executor.store.readResource(existingPimIri) as PimAssociation;
            return {
                associationIri: existingPimIri,
                associationEnds: association.pimEnd,
            }
        }

        // IRI of local PIM classes from the association ends
        const pimEnd: string[] = [];
        for (const endIri of resource.pimEnd) {
            const endPim = await this.sourcePimModel.readResource(endIri) as PimAssociationEnd;
            const endClass = await this.sourcePimModel.readResource(endPim.pimPart as string) as PimClass;
            const localPimIri = await executor.store.getPimHavingInterpretation(endClass.pimInterpretation as string, pimStoreSelector);
            if (localPimIri === null) {
                throw new Error('Unable to create PimAssociation because its end has no representative in the PIM store.');
            }
            pimEnd.push(localPimIri);
        }

        const pimCreateAssociation = new PimCreateAssociation(); // This operation creates AssociationEnds as well
        copyPimPropertiesFromResourceToOperation(resource, pimCreateAssociation);
        pimCreateAssociation.pimAssociationEnds = pimEnd;
        const pimCreateAssociationResult = await executor.applyOperation(pimCreateAssociation, pimStoreSelector);
        return {
            associationIri: pimCreateAssociationResult.created[0],
            associationEnds: pimCreateAssociationResult.created.slice(1)
        }
    }

    /**
     * This function creates all necessary PIM classes in a way that there will be correct extends hierarchy between
     * more generic class represented by {@param toClass} and more specific class represented by {@param fromClass}.
     *
     * Returns true if the path was found
     * @param fromClass
     * @param toClass
     * @param pimStoreSelector
     * @param executor
     * @private
     */
    private async createExtendsHierarchyFromTo(
        fromClass: PimClass,
        toClass: PimClass,
        pimStoreSelector: StoreDescriptor,
        executor: OperationExecutor,
    ): Promise<boolean> {
        // Find all classes which needs to be created or checked in order from most generic to most specific.
        const classesToProcess = new Set<string>();

        // DFS
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
                    }
                }
                path.delete(currentClass.iri as string);
            }

            if (success) {
                classesToProcess.add(currentClass.iri as string);
            }
            return success;
        }

        const success = await traverseFunction(fromClass);

        // Create each class and fix its extends
        for (const classToProcessIri of classesToProcess) {
            const classToProcess = await this.sourcePimModel.readResource(classToProcessIri) as PimClass;

            const iri = await createPimClassIfMissing(classToProcess, pimStoreSelector, executor);
            const localClass = await executor.store.readResource(iri) as PimClass;

            // PIM iris in local store
            const missingPimExtends: string[] = [];

            for (const extendsIri of classToProcess.pimExtends.filter(e => classesToProcess.has(e))) {
                const ext = await this.sourcePimModel.readResource(extendsIri) as PimClass;
                const extLocalIri = await executor.store.getPimHavingInterpretation(ext.pimInterpretation as string, pimStoreSelector) as string;
                if (!localClass.pimExtends.includes(extLocalIri)) {
                    missingPimExtends.push(extLocalIri);
                }
            }

            if (missingPimExtends.length > 0) {
                const pimSetExtends = new PimSetExtends();
                pimSetExtends.pimResource = iri;
                pimSetExtends.pimExtends = [...localClass.pimExtends, ...missingPimExtends];
                await executor.applyOperation(pimSetExtends, pimStoreSelector);
            }
        }

        return success;
    }
}
