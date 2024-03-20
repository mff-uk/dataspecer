import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { useState } from "react";
import { getAvailableLanguagesForLanguageString } from "../util/language-utils";

export const MultiLanguageInputForLanguageString = (props: {
    ls: LanguageString;
    setLs: React.Dispatch<React.SetStateAction<LanguageString>>;
    defaultLang: string;
    inputType: "text" | "textarea";
}) => {
    const AddLang = (props: { onEnterCallback: (l: string) => void }) => {
        const [active, setActive] = useState(false);
        const [l, setL] = useState("en");

        const reset = () => {
            setActive(false);
            setL(null as unknown as string);
        };

        if (active) {
            return (
                <li>
                    <input
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
                            }
                            if (e.key === "Escape") {
                                reset();
                            }
                        }}
                    />
                </li>
            );
        } else {
            return <li onClick={() => setActive(true)}>+lang</li>;
        }
    };

    const { ls, setLs, defaultLang } = props;
    const languages = getAvailableLanguagesForLanguageString(ls);
    const [currentLang, setCurrentLang] = useState(defaultLang || languages.at(0) || "en");

    if (!languages.includes(currentLang) && languages.length) {
        setCurrentLang(languages.at(0)!);
    }

    return (
        <div>
            <ul className="flex flex-row [&>*]:mx-1">
                {languages
                    .map((lang, i) => (
                        <li
                            onClick={() => {
                                setCurrentLang(lang);
                            }}
                            className={lang == currentLang ? "font-bold" : ""}
                        >
                            {lang}
                            {lang == currentLang && (
                                <button
                                    className="text-xs"
                                    onClick={() => {
                                        setLs((prev) =>
                                            Object.fromEntries(
                                                Object.entries(prev).filter(([l, _]) => l != currentLang)
                                            )
                                        );
                                    }}
                                >
                                    🗑
                                </button>
                            )}
                        </li>
                    ))
                    .concat(
                        <AddLang
                            onEnterCallback={(l) => {
                                setLs((prev) => ({ ...prev, [l]: "" }));
                                setCurrentLang(l);
                            }}
                        />
                    )}
            </ul>
            {props.inputType == "text" ? (
                <input
                    type="text"
                    className="w-[96%]"
                    value={ls[currentLang]!}
                    onChange={(e) => setLs((prev) => ({ ...prev, [currentLang]: e.target.value }))}
                />
            ) : (
                <textarea
                    value={ls[currentLang]!}
                    className="w-[96%]"
                    onChange={(e) => setLs((prev) => ({ ...prev, [currentLang]: e.target.value }))}
                />
            )}
        </div>
    );
};
