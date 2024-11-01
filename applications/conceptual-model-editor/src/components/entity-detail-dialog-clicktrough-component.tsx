import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useEntityProxy } from "../util/detail-utils";
import { useModelGraphContext } from "../context/model-context";
import { useClassesContext } from "../context/classes-context";
import { getIri, getModelIri } from "../util/iri-utils";
import { sourceModelOfEntity } from "../util/model-utils";
import { useOptions } from "../application/options";

const DEFAULT_MODEL_COLOR = "#ffffff";

export const ResourceDetailClickThrough = (props: {
    resource: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage;
    detailDialogLanguage?: string;
    onClick: () => void;
    withCardinality?: string;
    withIri?: boolean;
}) => {
    const { language } = useOptions();
    const { sourceModelOfEntityMap } = useClassesContext();
    const { aggregatorView, models } = useModelGraphContext();

    const { resource, onClick, withCardinality, withIri, detailDialogLanguage } = props;
    const name = useEntityProxy(resource, detailDialogLanguage ?? language).name;
    const modelColor = aggregatorView.getActiveVisualModel()?.getModelColor(sourceModelOfEntityMap.get(resource.id) ?? "") ?? DEFAULT_MODEL_COLOR;
    const iri = withIri ? getIri(resource, getModelIri(sourceModelOfEntity(resource.id, [...models.values()]))) : null;

    return (
        <div className="flex flex-row">
            <div className="flex cursor-pointer flex-row hover:underline" onClick={onClick}>
                <div className="my-auto mr-1 h-3 w-3" style={{ backgroundColor: modelColor }} />
                <span>{name}</span>
            </div>
            {iri && <span className="ml-1.5">({iri})</span>}
            {withCardinality && <span className="ml-1.5">: {withCardinality}</span>}
        </div>
    );
};
