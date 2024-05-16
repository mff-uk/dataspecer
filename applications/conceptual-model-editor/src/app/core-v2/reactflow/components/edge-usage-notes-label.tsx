import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedStringFromLanguageString } from "../../util/language-utils";
import { useConfigurationContext } from "../../context/configuration-context";

export const EdgeUsageNotesLabel = (props: { usageNotes?: LanguageString[] }) => {
    const { language } = useConfigurationContext();
    const { usageNotes } = props;

    if (!usageNotes) {
        return <></>;
    }

    const usageNoteLabels = usageNotes
        ?.filter((u) => Object.entries(u).length > 0)
        .map((u) => getLocalizedStringFromLanguageString(u, language))
        .filter((u): u is string => u != null);

    return (
        <div className="flex flex-col">
            {usageNoteLabels.map((usageNoteLabel) => (
                <div className="bg-blue-200">{usageNoteLabel}</div>
            ))}
        </div>
    );
};
