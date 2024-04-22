import { useEffect } from "react";
import { getStringFromLanguageStringInLang } from "../util/language-utils";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { useConfigurationContext } from "../context/configuration-context";

export const WhitespaceRegExp = new RegExp(/\s+/g);

export const IriInput = (props: {
    name: LanguageString;
    newIri: string | undefined;
    setNewIri: (i: string) => void;
    iriHasChanged: boolean;
    onChange?: () => void;
}) => {
    const { language: preferredLanguage } = useConfigurationContext();
    const { name, newIri, iriHasChanged, setNewIri } = props;

    useEffect(() => {
        if (iriHasChanged) {
            return;
        }

        const [n, l] = getStringFromLanguageStringInLang(name, preferredLanguage);

        if (l == null && n) {
            setNewIri(n.trim().toLowerCase().replaceAll(WhitespaceRegExp, "-"));
        }
    }, [name]);

    return (
        <input
            className="w-full"
            value={newIri}
            onChange={(e) => {
                setNewIri(e.target.value);
                props.onChange?.();
            }}
        />
    );
};
