import {
    type SemanticModelClass,
    type SemanticModelGeneralization,
    type SemanticModelRelationship,
    isSemanticModelAttribute,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useClassesContext } from "../../context/classes-context";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { type getEntityTypeString } from "../../util/detail-utils";
import { prepareSemanticModelEntitiesForSelect } from "../../service/entity-service";

type SupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

const getPossibleParents = (type: ReturnType<typeof getEntityTypeString>, resources: SupportedTypes[]) => {
    if (type == "relationship" || type == "relationship profile") {
        return resources
            .filter((r) => isSemanticModelRelationship(r) || isSemanticModelRelationshipUsage(r))
            .filter((r) => !isSemanticModelAttribute(r) && !isSemanticModelAttributeUsage(r));
    } else if (type == "relationship (attribute)" || type == "relationship profile (attribute)") {
        return resources.filter((r) => isSemanticModelAttribute(r) || isSemanticModelRelationshipUsage(r));
    } else if (type == "class" || type == "class profile") {
        return resources.filter((r) => isSemanticModelClass(r) || isSemanticModelClassUsage(r));
    }
    return [];
};

export const SelectGeneralizationParent = (props: {
    parentType: ReturnType<typeof getEntityTypeString>;
    valueSelected: null | Omit<SemanticModelGeneralization, "type" | "id">;
    onOptionSelected: (parentId: string) => void;
    alreadySpecialized: string[];
}) => {
    const { valueSelected, onOptionSelected, parentType, alreadySpecialized } = props;
    const { classes: c, relationships: r, profiles: p } = useClassesContext();
    const resources = [...c, ...r, ...p];

    const possibleParents = getPossibleParents(parentType, resources)?.filter((p) => !alreadySpecialized.includes(p.id)) ?? [];
    const values = prepareSemanticModelEntitiesForSelect(possibleParents);

    return (
        <div className="flex-grow">
            <select
                defaultValue={valueSelected?.parent}
                className="w-full"
                onChange={(e) => {
                    const value = e.target.value;
                    onOptionSelected(value);
                }}
            >
                <option value={undefined} disabled selected={valueSelected?.parent === undefined}>
                    ---
                </option>
                {values.map(item => (
                    <option key={item.identifier} value={item.identifier}>
                        {item.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
