import { ChangeEvent } from "react";

import { EntityRepresentative } from "../../utilities/dialog-utilities";
import { configuration } from "../../../application";
import { languageStringToString } from "../../../utilities/string";

export function SelectEntity<ValueType extends EntityRepresentative>(props: {
  language: string,
  items: ValueType[],
  value: ValueType,
  onChange: (value: ValueType) => void,
  disabled?: boolean,
}) {

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
      disabled={props.disabled}
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
