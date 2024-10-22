import { SemanticModelClass, SemanticModelRelationship } from '@dataspecer/core-v2/semantic-model/concepts';
import {PimResource} from "@dataspecer/core/pim/model";

export function copyPimPropertiesFromResourceToOperation(from: SemanticModelClass | SemanticModelRelationship, to: Pick<PimResource, "pimHumanLabel" | "pimHumanDescription" | "pimTechnicalLabel" | "pimInterpretation">) {
    to.pimHumanLabel = from.name;
    to.pimHumanDescription = from.description;
    to.pimInterpretation = from.id;
}
