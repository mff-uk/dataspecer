import type { SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { useClassesContext } from "../../../context/classes-context";
import { useEntityProxy } from "../../../util/detail-utils";
import { useOptions } from "../../../application/options";

const REMOVE_AFTER_SAVE = "after save this resource will no longer be a generalization of the modified resource";
const REMOVE_IMMEDIATELY = "this resource will no longer be a generalization of the modified resource";

export const RemovableGeneralizationRow = (props: {
    resource: SemanticModelGeneralization;
    toBeRemoved: boolean;
    removeButtonClick: () => void;
    duplicateNames: Set<string>;
    immediateRemoval?: boolean;
}) => {
    const { resource, toBeRemoved, removeButtonClick, immediateRemoval, duplicateNames } = props;

    const { language } = useOptions();
    const { classes: c, relationships: r, profiles: p } = useClassesContext();

    const { parent: parentId } = resource;

    const parent =
        c.find((cls) => cls.id == parentId) ??
        r.find((rel) => rel.id == parentId) ??
        p.find((prof) => prof.id == parentId);

    if (!parent) return;
    const { name, description, iri } = useEntityProxy(parent, language);

    return (
        <div className={`flex flex-row ${toBeRemoved ? "line-through" : ""}`} title={description ?? ""}>
            {name}
            {iri && duplicateNames.has(name ?? "") && (
                <span className="mx-2 text-slate-500" title={iri}>
                    {iri}
                </span>
            )}
            <button title={immediateRemoval ? REMOVE_IMMEDIATELY : REMOVE_AFTER_SAVE} onClick={removeButtonClick}>
                🗑
            </button>
        </div>
    );
};

export const NewRemovableGeneralizationRow = (props: {
    resource: Omit<SemanticModelGeneralization, "type" | "id">;
    removeButtonClick: () => void;
    duplicateNames: Set<string>;
}) => {
    return (
        <RemovableGeneralizationRow
            toBeRemoved={false}
            resource={props.resource as SemanticModelGeneralization}
            removeButtonClick={props.removeButtonClick}
            immediateRemoval={true}
            duplicateNames={props.duplicateNames}
        />
    );
};
