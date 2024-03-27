import { useState } from "react";
import { SupportedLanguageType, SupportedLanguages, useConfigurationContext } from "../context/configuration-context";

export const LanguageManagement = () => {
    const { language, changeLanguage } = useConfigurationContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLanguageSelected = (l: SupportedLanguageType) => {
        changeLanguage(l);
        setDropdownOpen(false);
    };

    return (
        <div className="my-auto">
            <div className="flex flex-col text-[15px]">
                <div className="relative flex flex-row">
                    <div>
                        lang:<span className="ml-2 font-mono">{language}</span>
                    </div>
                    <button className="white ml-2 text-[15px]" title="change language" onClick={toggleDropdown}>
                        🗃️
                    </button>
                    {dropdownOpen && (
                        <ul className="absolute z-10 mt-8 flex w-full flex-col bg-[#5438dc]">
                            {SupportedLanguages.map((l) => (
                                <li key={l} className="flex w-full flex-row justify-between">
                                    <button className="flex-grow" onClick={() => handleLanguageSelected(l)}>
                                        {l}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
