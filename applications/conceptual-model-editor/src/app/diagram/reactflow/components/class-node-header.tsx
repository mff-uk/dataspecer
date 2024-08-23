import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EntityProxy } from "../../util/detail-utils";
import { useConfigurationContext } from "../../context/configuration-context";

export const ClassNodeHeader = (props: {
    name: string | null;
    description: string | null;
    color?: string;
    isProfileOf?:
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage;
}) => {
    const { language } = useConfigurationContext();
    const { name, description, color, isProfileOf } = props;

    const profiledClassName = isProfileOf ? EntityProxy(isProfileOf, language).name : null;

    return (
        <h1
            className="flex flex-col overflow-x-hidden whitespace-nowrap border-b border-b-black"
            style={{ backgroundColor: color }}
            title={description ?? ""}
        >
            {isProfileOf && (
                <span className="text-gray-600">
                    profile
                    {` of ${profiledClassName ?? isProfileOf.id}`}
                </span>
            )}
            <div className="relative flex w-full flex-row justify-between">{name}</div>
        </h1>
    );
};
