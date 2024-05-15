import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";
import { OverrideFieldCheckbox } from "./override-field-checkbox";

export const MultiLanguageInputForLanguageStringWithOverride = (props: {
    forElement: string;
    ls: LanguageString;
    setLs: React.Dispatch<React.SetStateAction<LanguageString>>;
    defaultLang: string;
    inputType: "text" | "textarea";
    disabled?: boolean;
    onChange?: () => void;
    withOverride?: () => void;
    style?: string;
}) => {
    const { forElement, ls, setLs, disabled, inputType, defaultLang, onChange, style, withOverride } = props;

    return (
        <div className="flex flex-row">
            <div className={`flex-grow ${style}`}>
                <MultiLanguageInputForLanguageString
                    ls={ls}
                    setLs={setLs}
                    defaultLang={defaultLang}
                    inputType={inputType}
                    disabled={disabled}
                    onChange={onChange}
                />
            </div>
            {withOverride && (
                <div className="my-auto ml-2">
                    <OverrideFieldCheckbox forElement={forElement} onChecked={withOverride} />
                </div>
            )}
        </div>
    );
};
