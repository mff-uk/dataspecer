import { useEffect, useState } from "react";
import { IRI } from "iri";
import type { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { TwoWaySwitch } from "./two-way-switch";
import { useConfigurationContext } from "../../context/configuration-context";
import { getStringFromLanguageStringInLang } from "../../util/language-utils";

export const WhitespaceRegExp = new RegExp(/\s+/g);
export const NonAlphaNumeric = new RegExp(/[^a-zA-Z0-9-]/g);

export const IriInput = (props: {
    name: LanguageString;
    newIri: string | undefined;
    baseIri: string | undefined;
    setNewIri: (i: string) => void;
    iriHasChanged: boolean;
    onChange?: () => void;
    disabled?: boolean;
    withNameSuggestionsDisabled?: boolean;
}) => {
    const { language: preferredLanguage } = useConfigurationContext();
    const { name, baseIri, newIri, iriHasChanged, setNewIri, disabled, withNameSuggestionsDisabled } = props;
    const absoluteIri = (new IRI(newIri ?? "").scheme()?.length ?? 0) > 0;

    const [workingWithAbsoluteIri, setWorkingWithAbsoluteIri] = useState(absoluteIri);
    const [shouldIncludeBaseIri, setShouldIncludeBaseIri] = useState(!absoluteIri ?? true);

    useEffect(() => {
        if (iriHasChanged || workingWithAbsoluteIri || withNameSuggestionsDisabled) {
            return;
        }

        const [n, l] = getStringFromLanguageStringInLang(name, preferredLanguage);

        if (l == null && n) {
            setNewIri(n.trim().toLowerCase().replaceAll(WhitespaceRegExp, "-").replaceAll(NonAlphaNumeric, ""));
        }
    }, [name]);

    return (
        <div className={`flex w-full flex-col ${disabled ? "opacity-50" : ""}`}>
            <TwoWaySwitch
                disabled={disabled}
                choices={["absolute", "relative"]}
                selected={workingWithAbsoluteIri ? "absolute" : "relative"}
                onChoiceSelected={(choice) => {
                    const isAbs = choice == "absolute";
                    setWorkingWithAbsoluteIri(isAbs);
                    props.onChange?.();
                    if (!isAbs) {
                        return;
                    }

                    if (shouldIncludeBaseIri) {
                        setNewIri((baseIri ?? "") + (newIri ?? ""));
                        setShouldIncludeBaseIri(false);
                    }
                }}
            />
            <div className="flex flex-row">
                {workingWithAbsoluteIri ? (
                    <>
                        <input
                            disabled={disabled}
                            className="flex-grow"
                            value={newIri}
                            onChange={(e) => {
                                setNewIri(e.target.value);
                                props.onChange?.();
                            }}
                        />
                    </>
                ) : (
                    <>
                        <div className="text-nowrap">{baseIri}</div>
                        <input
                            disabled={disabled}
                            className="flex-grow"
                            value={newIri}
                            onChange={(e) => {
                                setNewIri(e.target.value);
                                props.onChange?.();
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
