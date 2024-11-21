import { ChangeEvent } from "react";

import { DataTypeRepresentative } from "../../utilities/dialog-utilities";
import { configuration } from "../../../application";
import { languageStringToString } from "../../../utilities/string";

export const SelectDataType = (props: {
  language: string,
  items: DataTypeRepresentative[],
  value: DataTypeRepresentative,
  onChange: (value: DataTypeRepresentative) => void,
}) => {

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const identifier = event.target.value;
    for (const item of props.items) {
      if (item.identifier === identifier) {
        props.onChange(item);
      }
    }
  };

  const languagePreferences = configuration().languagePreferences;

  return (
    <select
      className="w-full"
      onChange={onChange}
      value={props.value.identifier}
    >
      {props.items.map(item => (
        <option key={item.identifier} value={item.identifier}>
          {languageStringToString(
            languagePreferences,
            props.language, item.label)}
        </option>
      ))}
    </select>
  );
};
