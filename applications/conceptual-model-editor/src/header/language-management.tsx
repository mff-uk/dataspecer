import { DropDownCatalog } from "../components/management/dropdown-catalog";
import { type Language, SupportedLanguages, useOptions } from "../application/options";

export const LanguageManagement = () => {
  const options = useOptions();
  return (
    <DropDownCatalog
      label="lang"
      valueSelected={options.language}
      openCatalogTitle="Change preferred language"
      availableValues={SupportedLanguages}
      onValueSelected={(value) => options.setLanguage(value as Language)}
    />
  );
};
