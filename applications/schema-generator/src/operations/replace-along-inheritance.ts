import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {CoreResourceReader} from "@model-driven-data/core/core";
import {PimClass, PimResource} from "@model-driven-data/core/pim/model";
import {DataPsmCreateClass, DataPsmDeleteClass, DataPsmReplaceAlongInheritance} from "@model-driven-data/core/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";
import {selectLanguage} from "../utils/selectLanguage";
import {removeDiacritics} from "../utils/remove-diacritics";
import {isPimAncestorOf} from "../store/utils/is-ancestor-of";
import {getPimHavingInterpretation} from "../store/utils/get-pim-having-interpretation";
import {extendPimClassesAlongInheritance} from "./helper/extend-pim-classes-along-inheritance";

/**
 * Replaces an existing DataPSM class with a new one that interprets given CIM
 * iri. The replaced class needs to be a subclass or superclass of the class to
 * be replaced.
 */
export class ReplaceAlongInheritance implements ComplexOperation {
    public labelRules: {
        languages: string[],
        namingConvention: "camelCase" | "PascalCase" | "kebab-case" | "snake_case",
        specialCharacters: "allow" | "remove-diacritics" | "remove-all",
    } | null = null;

    private readonly fromDataPsmClassIri: string;
    private readonly toPimClassIri: string;
    private readonly sourcePimModel: CoreResourceReader;

    /**
     * @param fromDataPsmClassIri Class IRI from the local store that is to be replaced and removed.
     * @param toPimClassIri Class IRI from the {@link sourcePimModel} that is to be used as replacement.
     * @param sourcePimModel The PIM model that contains the replacement class and full inheritance hierarchy.
     */
    constructor(
      fromDataPsmClassIri: string,
      toPimClassIri: string,
      sourcePimModel: CoreResourceReader,
      ) {
        this.fromDataPsmClassIri = fromDataPsmClassIri;
        this.toPimClassIri = toPimClassIri;
        this.sourcePimModel = sourcePimModel;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const fromDataPsmClass = await executor.store.readResource(this.fromDataPsmClassIri) as DataPsmClass;
        const fromPimClass = await executor.store.readResource(fromDataPsmClass.dataPsmInterpretation as string) as PimClass;
        const dataPsmStoreSelector = new StoreHavingResourceDescriptor(fromDataPsmClass.iri as string);

        const sourceFromPimClassIri = await getPimHavingInterpretation(this.sourcePimModel, fromPimClass.pimInterpretation as string) as string;

        // Create all PIM classes
        const isSpecialization = await isPimAncestorOf(
          this.sourcePimModel,
          sourceFromPimClassIri,
          this.toPimClassIri
        );


        const sourceFromPimClass = await this.sourcePimModel.readResource(sourceFromPimClassIri) as PimClass;
        const sourceToPimClass = await this.sourcePimModel.readResource(this.toPimClassIri) as PimClass; //vec
        const pimStoreSelector = new StoreHavingResourceDescriptor(fromPimClass.iri as string);

        const result = await extendPimClassesAlongInheritance(
            !isSpecialization ? sourceFromPimClass : sourceToPimClass,
            isSpecialization ? sourceFromPimClass : sourceToPimClass,
            pimStoreSelector,
            executor,
            this.sourcePimModel
        );
        if (!result) {
            throw new Error("Could not extend PIM classes along inheritance.");
        }


        // Create data PSM class

        const toPimClassIri = await executor.store.getPimHavingInterpretation(sourceToPimClass.pimInterpretation as string, pimStoreSelector);
        const toPimClass = await executor.store.readResource(toPimClassIri as string) as PimClass;
        console.log(toPimClass);

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = toPimClassIri;
        dataPsmCreateClass.dataPsmTechnicalLabel = this.getTechnicalLabelFromPim(toPimClass) ?? null;
        const dataPsmCreateClassResult = await executor.applyOperation(dataPsmCreateClass, dataPsmStoreSelector);
        const toPsmClassIri = dataPsmCreateClassResult.created[0];

        // Replace data psm classes

        const dataPsmReplaceAlongInheritance = new DataPsmReplaceAlongInheritance();
        dataPsmReplaceAlongInheritance.dataPsmOriginalClass = fromDataPsmClass.iri;
        dataPsmReplaceAlongInheritance.dataPsmReplacingClass = toPsmClassIri;
        await executor.applyOperation(dataPsmReplaceAlongInheritance, dataPsmStoreSelector);

        // Remove the old class

        const dataPsmDeleteClass = new DataPsmDeleteClass();
        dataPsmDeleteClass.dataPsmClass = fromDataPsmClass.iri;
        await executor.applyOperation(dataPsmDeleteClass, dataPsmStoreSelector);
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
}