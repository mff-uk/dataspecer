import type { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { type ReactNode, useState, useEffect } from "react";
import { getAvailableLanguagesForLanguageString } from "../../util/language-utils";

const LanguageItem = (props: {
    children: ReactNode;
    onClick: () => void;
    onDeleted: () => void;
    selected?: boolean;
    disabled?: boolean;
}) => {
    const { children, onClick, onDeleted, selected, disabled } = props;
    return (
        <li onClick={onClick} className={selected ? "font-bold" : ""}>
            {children}
            {!selected || disabled ? null : (
                <button disabled={disabled} className="text-xs" onClick={onDeleted}>
                    🗑
                </button>
            )}
        </li>
    );
};

export const MultiLanguageInputForLanguageString = (props: {
    ls: LanguageString;
    setLs: React.Dispatch<React.SetStateAction<LanguageString>>;
    defaultLang: string;
    inputType: "text" | "textarea";
    disabled?: boolean;
    onChange?: () => void;
}) => {
    const { disabled, defaultLang: preferredLanguage } = props;

    const AddLang = (props: { onEnterCallback: (l: string) => void }) => {
        const [active, setActive] = useState(false);
        const [l, setL] = useState(preferredLanguage);

        const reset = () => {
            setActive(false);
            setL(null as unknown as string);
        };

        if (active) {
            return (
                <li>
                    <input
                        disabled={disabled}
                        autoFocus
                        value={l}
                        size={4}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setL(e.target.value)}
                        onBlur={() => {
                            props.onEnterCallback(l);
                            reset();
                        }}
                        onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                props.onEnterCallback(l);
                                reset();
                                e.stopPropagation();
                            }
                            if (e.key === "Escape") {
                                reset();
                                e.stopPropagation();
                            }
                        }}
                    />
                </li>
            );
        } else {
            return (
                <li
                    onClick={() => {
                        if (!disabled) {
                            setActive(true);
                        }
                    }}
                >
                    +lang
                </li>
            );
        }
    };

    const languageDeletedHandler = () => {
        setLs((prev) => Object.fromEntries(Object.entries(prev).filter(([l, _]) => l != currentLang)));
        props.onChange?.();
    };

    const { ls, setLs } = props;
    const languages = getAvailableLanguagesForLanguageString(ls);
    const [currentLang, setCurrentLang] = useState(preferredLanguage || languages.at(0) || "en");

    // In this hook we make sure that selected language is one of the available ones.
    // For example when user deleted language it will change it to next one.
    useEffect(() => {
        if (!languages.includes(currentLang) && languages.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setCurrentLang(languages.at(0)!);
            props.onChange?.();
        }
    }, [languages, currentLang]) ;

    const displayString = ls[currentLang] ?? "";

    return (
        <div>
            <ul className="flex flex-row text-base [&>*]:mx-1">
                {languages
                    .map((lang, i) => (
                        <LanguageItem
                            key={lang + i.toString()}
                            onClick={() => setCurrentLang(lang)}
                            onDeleted={languageDeletedHandler}
                            selected={lang == currentLang}
                            disabled={disabled}
                        >
                            {lang}
                        </LanguageItem>
                    ))}
                {disabled ? null : <AddLang
                    key={"add-language-button"}
                    onEnterCallback={(l) => {
                        setLs((prev) => ({ ...prev, [l]: "" }));
                        setCurrentLang(l);
                        props.onChange?.();
                    }}
                />}
            </ul>
            {props.inputType == "text" ? (
                <input
                    disabled={disabled}
                    type="text"
                    className="w-full"
                    value={displayString}
                    onChange={(e) => {
                        setLs((prev) => ({ ...prev, [currentLang]: e.target.value }));
                        props.onChange?.();
                    }}
                />
            ) : (
                <textarea
                    disabled={disabled}
                    value={displayString}
                    className="w-full"
                    onChange={(e) => {
                        setLs((prev) => ({ ...prev, [currentLang]: e.target.value }));
                        props.onChange?.();
                    }}
                />
            )}
        </div>
    );
};
