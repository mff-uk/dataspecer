import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { PackageContext } from "./views";
import { OFN_LABELS } from "@dataspecer/core/well-known";

/**
 * Basic functions that can be used anywhere
 */
export function prepareFunctions(
    view: object,
    context: PackageContext,
) {
    return {
        ...view,
        translate: function () {
            return this.cs ?? this.en ?? null;
        },
        relativePath: function () {
            return pathRelative(context.artefact.publicUrl, this);
        },
        sanitizeLink: function () {
            return this.replace(/ /g, "-").toLowerCase();
        },
        cardinalityRange: function () {
            return `${this.cardinalityMin ?? 0} - ${this.cardinalityMax ?? "∞"}`;
        },
        cardinalityIsRequired: function () {
            return this.cardinalityMin && this.cardinalityMin > 0;
        },
        getLabelForDataType: function () {
            return OFN_LABELS[this];
        }
    }
}