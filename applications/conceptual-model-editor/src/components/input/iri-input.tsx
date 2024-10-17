import { type ChangeEvent, useEffect, useState } from "react";
import { IRI } from "iri";
import type { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { TwoWaySwitch } from "./two-way-switch";
import { getStringFromLanguageStringInLang } from "../../util/language-utils";
import { useOptions } from "../../application/options";

enum IriType {
    absolute ="absolute",
    relative = "relative",
}

export const IriInput = (props: {
    /**
     * Name of the entity we are creating IRI for.
     */
    name: LanguageString;
    /**
     * Value of the IRI.
     */
    newIri: string | undefined;
    /**
     * Base IRI when relative IRI is used.
     */
    baseIri: string | undefined;
    /**
     * Callback to set new IRI.
     */
    setNewIri: (iri: string) => void;
    /**
     * Thrue if IRI has been changed by the user.
     * If so we stop auto-generating from name.
     */
    iriHasChanged: boolean;
    /**
     * Called when newIri change from within this component.
     * Does not pass any value, just to notify the caller.
     */
    onChange?: () => void;
    /**
     * True to disable the element.
     */
    disabled?: boolean;
    /**
     * Method used to suggest IRI.
     * When undefined there is no generation.
     */
    nameSuggestion?: (name: string) => string,
}) => {
    const { language: preferredLanguage } = useOptions();
    const { name, newIri, iriHasChanged, setNewIri, disabled } = props;

    const baseIri = props.baseIri ?? "";

    const absoluteIri = isAbsoluteIri(newIri);
    const [workingWithAbsoluteIri, setWorkingWithAbsoluteIri] = useState(absoluteIri);

    const generateIriFromName = () => {
        if (iriHasChanged || workingWithAbsoluteIri || props.nameSuggestion === undefined) {
            return;
        }
        const [next, language] = getStringFromLanguageStringInLang(name, preferredLanguage);
        if (language == null && next) {
            setNewIri(props.nameSuggestion(next));
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(generateIriFromName, [name]);

    const onChangeIriType = (choice: string) => {
        // Update state.
        const isAbsolute = choice == IriType.absolute;
        setWorkingWithAbsoluteIri(isAbsolute);
        // Notify parent.
        props.onChange?.();

        // Now .. we are changing between relative and absolute
        // so we may need to update.
        if (isAbsolute && !isAbsoluteIri(newIri)) {
            // relative -> absolute : we need to add base IRI
            setNewIri(baseIri + (newIri ?? ""));
        } else {
            // absolute -> relative : we need to remove base IRI
            if (newIri?.startsWith(baseIri)) {
                const iriWithoutBase = newIri.slice(baseIri.length);
                setNewIri(iriWithoutBase);
            }
        }
    };

    const onChangeIri = (event: ChangeEvent<HTMLInputElement>) => {
        setNewIri(event.target.value);
        props.onChange?.();
    };

    return (
        <div className={`flex w-full flex-col ${disabled ? "opacity-50" : ""}`}>
            <TwoWaySwitch
                disabled={disabled}
                choices={[IriType.absolute, IriType.relative]}
                selected={workingWithAbsoluteIri ? IriType.absolute : IriType.relative}
                onChoiceSelected={onChangeIriType}
            />
            <div className="flex flex-col md:flex-row">
                {workingWithAbsoluteIri ? null : <div className="text-nowrap">{baseIri}</div> }
                <input
                    disabled={disabled}
                    className="flex-grow"
                    value={newIri}
                    onChange={onChangeIri}
                />
            </div>
        </div>
    );
};

function isAbsoluteIri(iri: string | undefined): boolean {
    if (iri == undefined) {
        return false;
    }
    return (new IRI(iri).scheme()?.length ?? 0) > 0;
}
