import { useState } from "react";
import type {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { NewRemovableGeneralizationRow, RemovableGeneralizationRow } from "./modify/removable-generalization-row";
import { SelectGeneralizationParent } from "../input/select-generalization-parent";
import { getRandomName } from "~/app/utils/random-gen";
import type { getEntityTypeString } from "../../util/detail-utils";
import { getDuplicateNames } from "../../util/name-utils";
import { useClassesContext } from "../../context/classes-context";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const GeneralizationParentsComponent = (props: {
    modifiedEntityId: string;
    modifiedEntityType: ReturnType<typeof getEntityTypeString>;
    currentParentsAsGeneralizations: SemanticModelGeneralization[];
    toBeRemovedGeneralizationParents: string[];
    existingParentRemoveButtonClick: (genId: string) => void;
    newGeneralizationParents: Omit<SemanticModelGeneralization, "type" | "id">[];
    addNewGeneralizationParent: (gen: Omit<SemanticModelGeneralization, "type" | "id">) => void;
    removeNewGeneralizationParent: (gen: Omit<SemanticModelGeneralization, "type" | "id">) => void;
}) => {
    const {
        modifiedEntityId,
        modifiedEntityType,
        currentParentsAsGeneralizations,
        toBeRemovedGeneralizationParents,
        existingParentRemoveButtonClick,
        newGeneralizationParents,
        addNewGeneralizationParent,
        removeNewGeneralizationParent,
    } = props;
    const { classes: c, relationships: r, profiles: p } = useClassesContext();

    const [newParent, setNewParent] = useState<null | Omit<SemanticModelGeneralization, "type" | "id">>(null);

    const [showSelectParent, setShowSelectParent] = useState(false);

    const handleSpecializationAdded = () => {
        if (!newParent) {
            alert("no parent selected");
            return;
        }
        addNewGeneralizationParent(newParent);
        setNewParent(null);
        setShowSelectParent(false);
    };

    const resources = [...c, ...r, ...p];
    const parents = [...currentParentsAsGeneralizations, ...newGeneralizationParents]
        .map((g) => resources.find((res) => res.id == g.parent))
        .filter(
            (
                res
            ): res is
                | SemanticModelClass
                | SemanticModelClassUsage
                | SemanticModelRelationship
                | SemanticModelRelationshipUsage => res != undefined
        );
    const duplicateNames = getDuplicateNames(parents);

    return (
        <div className="flex w-full flex-col">
            {currentParentsAsGeneralizations.map((g) => (
                <RemovableGeneralizationRow
                    key={"to-be-removed-specialization-" + g.id}
                    resource={g}
                    toBeRemoved={toBeRemovedGeneralizationParents.includes(g.id)}
                    removeButtonClick={() => existingParentRemoveButtonClick(g.id)}
                    duplicateNames={duplicateNames}
                />
            ))}
            {newGeneralizationParents.map((g, i) => (
                <NewRemovableGeneralizationRow
                    resource={g}
                    key={"removable-specialization-" + (g.iri ?? i.toString())}
                    removeButtonClick={() => removeNewGeneralizationParent(g)}
                    duplicateNames={duplicateNames}
                />
            ))}
            {showSelectParent ? (
                <div className="flex flex-row items-center">
                    <button
                        className="mr-2 bg-white px-2 py-1 hover:shadow-sm"
                        disabled={newParent == null}
                        onClick={handleSpecializationAdded}
                    >
                        ✅ add
                    </button>
                    <SelectGeneralizationParent
                        parentType={modifiedEntityType}
                        valueSelected={newParent}
                        onOptionSelected={(parentId) =>
                            setNewParent({
                                child: modifiedEntityId,
                                parent: parentId,
                                iri: getRandomName(10),
                            })
                        }
                        alreadySpecialized={[
                            ...currentParentsAsGeneralizations.map((g) => g.parent),
                            ...newGeneralizationParents.map((g) => g.parent),
                        ]}
                    />
                </div>
            ) : (
                <div className="text-left">
                    <button className=" bg-white px-2 py-1 hover:shadow-sm" onClick={() => setShowSelectParent(true)}>
                        ➕ Add generalization
                    </button>
                </div>
            )}
        </div>
    );
};
