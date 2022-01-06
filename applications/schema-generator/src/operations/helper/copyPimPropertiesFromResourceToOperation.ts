import {PimResource} from "model-driven-data/pim/model";

export function copyPimPropertiesFromResourceToOperation(from: PimResource, to: Pick<PimResource, "pimHumanLabel" | "pimHumanDescription" | "pimTechnicalLabel" | "pimInterpretation">) {
    to.pimHumanLabel = from.pimHumanLabel;
    to.pimHumanDescription = from.pimHumanDescription;
    to.pimTechnicalLabel = from.pimTechnicalLabel;
    to.pimInterpretation = from.pimInterpretation;
}
