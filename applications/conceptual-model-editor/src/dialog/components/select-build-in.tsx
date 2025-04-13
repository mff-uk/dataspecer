import { ChangeEvent } from "react";

import { t } from "../../application";

export function SelectBuildIn(props: {
  items: { value: string, label: string }[],
  value: string,
  onChange: (value: string) => void,
}) {

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    props.onChange(event.target.value);
  };

  return (
    <select
      className="w-full"
      onChange={onChange}
      value={props.value}
    >
      {props.items.map(item => (
        <option key={item.value} value={item.value}>
          {t(item.label)}
        </option>
      ))}
    </select>
  );
};
