import { ChangeEvent, useState } from "react";

import { EntityRepresentative } from "../../dialog-utilities";
import { configuration, t } from "../../../application";
import { languageStringToString } from "../../../utilities/string";

export interface Specialization {

  specialized: string;

  iri: string;

}

export const SpecializationSelect = (props: {
  language: string,
  items: EntityRepresentative[],
  specializations: Specialization[],
  addSpecialization: (specialized: string) => void,
  removeSpecialization: (value: Specialization) => void,
}) => {
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<EntityRepresentative>(props.items[0]);

  const candidatesToAdd: EntityRepresentative[] = [];
  const active: [EntityRepresentative, Specialization][] = [];
  for (const item of props.items) {
    const specialization = props.specializations.find(
      specialization => specialization.specialized === item.identifier);
    if (specialization === undefined) {
      candidatesToAdd.push(item);
    } else {
      active.push([item, specialization]);
    }
  }

  const addSpecialization = () => {
    props.addSpecialization(selected.identifier);
    setAdding(!adding);
  };

  const openAdd = () => {
    // Select default value.
    setSelected(candidatesToAdd[0]);
    setAdding(true);
  };

  return (
    <div className="flex w-full flex-col">
      <div>
        {active.map(([item, specialization]) => (
          <RemovableSpecialization
            key={item.identifier}
            language={props.language}
            item={item}
            specialization={specialization}
            removeSpecialization={props.removeSpecialization}
          />
        ))}
        {/* If there is nothing to add we do not offer that to the user. */}
        {candidatesToAdd.length === 0 ? null : (adding
          ? (
            <div className="flex w-full flex-row gap-1">
              <button onClick={addSpecialization}>
                Add
              </button>
              <button onClick={() => setAdding(!adding)}>
                Cancel
              </button>
              <SelectClass
                language={props.language}
                items={candidatesToAdd}
                value={selected}
                onChange={setSelected}
              />
            </div>
          ) : (
            <button
              className="px-2 py-1 hover:shadow-sm"
              onClick={openAdd}
              title={t("create-class-dialog.add-specialization")}
            >
              ➕
            </button>
          ))}
      </div>
    </div>
  );
};

const SelectClass = (props: {
  language: string,
  items: EntityRepresentative[],
  value: EntityRepresentative,
  onChange: (value: EntityRepresentative) => void,
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

const RemovableSpecialization = (props: {
  language: string,
  item: EntityRepresentative,
  specialization: Specialization,
  removeSpecialization: (value: Specialization) => void,
}) => {
  const languagePreferences = configuration().languagePreferences;
  return (
    <div>
      <button onClick={() => props.removeSpecialization(props.specialization)}>
        🗑
      </button>
      &nbsp;
      {languageStringToString(
        languagePreferences,
        props.language, props.item.label)}
    </div>
  )
}
