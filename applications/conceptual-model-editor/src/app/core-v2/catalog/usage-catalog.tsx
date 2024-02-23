import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { getNameOrIriAndDescription, getStringFromLanguageStringInLang, getUsageNote } from "../util/language-utils";
import { shortenStringTo } from "../util/utils";

export const UsageCatalog = () => {
    const { classes, relationships, attributes, usages } = useClassesContext();
    return (
        <>
            <ul>
                {usages.map((u) => {
                    const note = getUsageNote(u);
                    const targetEntity =
                        classes.get(u.usageOf)?.cls ?? relationships.find((r) => r.id == u.usageOf) ?? null;
                    const [targetName, targetDescription] = getNameOrIriAndDescription(
                        targetEntity,
                        targetEntity?.iri ?? u.usageOf
                    );
                    return (
                        <li key={u.id}>
                            <div
                                className="flex flex-row justify-between whitespace-nowrap hover:shadow"
                                title={targetDescription ?? ""}
                            >
                                <div>
                                    <span className="font-gray-500">{targetName}</span>: {note}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};
