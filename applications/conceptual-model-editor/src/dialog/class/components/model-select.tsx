import { ChangeEvent } from "react";

import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

import { EntityModelRepresentative } from "../../dialog-utilities";
import { configuration } from "../../../application";
import { languageStringToString } from "../../../utilities/string";

export const ModelSelect = (props: {
  language: string,
  items: EntityModelRepresentative<InMemorySemanticModel>[],
  value: EntityModelRepresentative<InMemorySemanticModel>,
  onChange: (value: EntityModelRepresentative<InMemorySemanticModel>) => void,
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
      name="models"
      id="models"
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
