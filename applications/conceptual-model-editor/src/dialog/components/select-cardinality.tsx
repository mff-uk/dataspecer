import { Cardinality } from "../utilities/dialog-utilities";

export function SelectCardinality(props: {
  items: Cardinality[],
  value: Cardinality,
  onChange: (value: Cardinality) => void,
  disabled?: boolean,
}) {
  return (
    <fieldset className="flex flex-grow flex-row">
      {props.items.map(cardinality => (
        <div className="mr-3" key={cardinality.identifier}>
          <input
            type="radio"
            value={cardinality.identifier}
            onChange={() => props.onChange(cardinality)}
            checked={cardinality.identifier === props.value.identifier}
            disabled={props.disabled}
          />
          <label className="ml-1 font-mono">
            {cardinality.label}
          </label>
        </div>
      ))}
    </fieldset>
  );
}
