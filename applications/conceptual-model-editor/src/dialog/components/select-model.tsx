import { ChangeEvent } from "react";

import { configuration } from "../../application";
import { languageStringToString } from "../../utilities/string";
import { CmeSemanticModel } from "../../dataspecer/cme-model";

export const SelectModel = (props: {
  language: string,
  items: CmeSemanticModel[],
  value: CmeSemanticModel,
  onChange: (value: CmeSemanticModel) => void,
  disabled?: boolean,
}) => {

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const identifier = event.target.value;
    for (const item of props.items) {
      if (item.dsIdentifier === identifier) {
        props.onChange(item);
      }
    }
  };

  const languagePreferences = configuration().languagePreferences;

  return (
    <select
      className="w-full"
      name="models"
      id="models"
      onChange={onChange}
      value={props.value.dsIdentifier}
      disabled={props.disabled}
    >
      {props.items.map(item => (
        <option key={item.dsIdentifier} value={item.dsIdentifier}>
          {languageStringToString(
            languagePreferences,
            props.language, item.displayLabel)}
        </option>
      ))}
    </select>
  );
};
