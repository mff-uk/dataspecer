import { ConceptualModelComplexType } from "@dataspecer/core/conceptual-model/model/conceptual-model-type";
import { filterByStructural } from "@dataspecer/core/conceptual-model/transformation/filter-by-structural";
import { assertNot } from "@dataspecer/core/core/utilities/assert";
import { DataSpecificationSchema } from "@dataspecer/core/data-specification/model";
import { getArtifactsView } from "./artifacts";
import { PackageContext } from "./views";
import { ConceptualModelClass, ConceptualModelProperty } from "@dataspecer/core/conceptual-model/index";

/**
 * Prepares view for common information about data specification.
 */
export function prepareDataSpecification(
    view: object,
    context: PackageContext,
) {
    const generatorContext = context.context;
    let conceptualModel = generatorContext.conceptualModels[context.specification.pim];
    assertNot(
      conceptualModel === undefined,
      `Missing conceptual model ${context.specification.pim}.`
    );

    const structureModels = context.specification.psms.map(psm => generatorContext.structureModels[psm]);
    conceptualModel = filterByStructural(conceptualModel, structureModels);

    // Sort properties in conceptual model
    // Link classes to properties
    for (const c of Object.values(conceptualModel.classes)) {
        c.properties = [
            ...c.properties.filter(p => p.dataTypes[0]?.isAttribute()),
            ...c.properties.filter(p => !p.dataTypes[0]?.isAttribute()),
        ];
        c.properties.forEach(p => {
            p.dataTypes.filter(dt => dt.isAssociation()).forEach((dt: ConceptualModelComplexType) => {
                // @ts-ignore
                dt.class = conceptualModel.classes[dt.pimClassIri];
            });
        });
    }

    return {
        ...view,
        semanticModels: [{
            ...conceptualModel,
            classes: Object.values(conceptualModel.classes)
        }],
        structureModels: context.specification.psms.map(iri => {
            return {
                ...generatorContext.structureModels[iri],
                ...getArtifactsView(
                    context,
                    context.specification.artefacts.filter(
                        // @ts-ignore
                        a => context.artefact.artefacts.includes(a.iri)
                    ).filter(DataSpecificationSchema.is).filter(a => a.psm === iri).map(a => a.iri)
                ),
            }
        }),
        semanticModelLinkId: function() {
            function normalizeLabel(label: string) {
                return label.replace(/ /g, "-").toLowerCase();
            }

            const entity = this as ConceptualModelClass | ConceptualModelProperty;
            const iri = entity.cimIri ?? null;
            const iriSuffix = iri ? `-${iri}` : "";

            if (this instanceof ConceptualModelClass) {
                const label = this.humanLabel?.cs ?? this.humanLabel?.en ?? "";
                return `konceptuální-třída-${normalizeLabel(label)}${iriSuffix}`;
            } else if (this instanceof ConceptualModelProperty) {
                const parentClass = Object.values(conceptualModel.classes).find(c => c.properties.find(p => p.pimIri === this.pimIri))!;
                const parentLabel = parentClass.humanLabel?.cs ?? parentClass.humanLabel?.en ?? "";
                const label = this.humanLabel?.cs ?? this.humanLabel?.en ?? "";
                return `konceptuální-vlastnost-${normalizeLabel(parentLabel)}-${normalizeLabel(label)}${iriSuffix}`;
            }
        },
    }
}