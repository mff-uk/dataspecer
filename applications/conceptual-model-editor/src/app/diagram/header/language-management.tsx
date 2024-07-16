import {
    type SupportedLanguageType,
    SupportedLanguages,
    useConfigurationContext,
} from "../context/configuration-context";
import { DropDownCatalog } from "../components/management/dropdown-catalog";

export const LanguageManagement = () => {
    const { language, changeLanguage } = useConfigurationContext();

    const handleLanguageSelected = (l: SupportedLanguageType) => {
        changeLanguage(l);
    };

    return (
        <DropDownCatalog
            catalogName="lang"
            valueSelected={language}
            openCatalogTitle="change preferred language"
            availableValues={SupportedLanguages as readonly string[]}
            onValueSelected={(value) => handleLanguageSelected(value as unknown as SupportedLanguageType)}
        />
    );
};
