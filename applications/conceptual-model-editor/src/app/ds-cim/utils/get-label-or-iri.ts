import { PimResource } from "@dataspecer/core/pim/model";

export const getLabelOrIri = (resource: PimResource) => {
    if (resource.pimHumanLabel?.en) return resource.pimHumanLabel.en.slice(-25);
    else if (resource.pimHumanLabel?.cs) return resource.pimHumanLabel.cs.slice(-25);
    else if (resource.iri) return resource.iri.slice(-15);
    else return "Missing label and iri";
};
