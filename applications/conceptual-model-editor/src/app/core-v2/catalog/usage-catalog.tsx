import { useClassesContext } from "../context/classes-context";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { getNameOrIriAndDescription, getStringFromLanguageStringInLang, getUsageNote } from "../util/language-utils";

export const UsageCatalog = () => {
    const { classes, relationships, attributes, usages } = useClassesContext();
    const { openEntityDetailDialog, EntityDetailDialog, isEntityDetailDialogOpen } = useEntityDetailDialog();
    console.log(usages);
    return (
        <>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            <ul>
                {usages.map((u) => {
                    const [usageName, usageNameFallbackLang] = getStringFromLanguageStringInLang(u.name ?? {});
                    const [usageDescription, usageDescriptionFallbackLang] = getStringFromLanguageStringInLang(
                        u.description ?? {}
                    );
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
                                    <span className="font-gray-500">{targetName}</span>:
                                    <span title={usageDescription ?? ""}>
                                        {usageName}@{usageNameFallbackLang}
                                    </span>
                                </div>
                                <div>
                                    <button onClick={() => openEntityDetailDialog(u)}>Detail</button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};
