import { useState } from "react";

export const InputEntityRow = (props: { onClickHandler: (search: string) => void }) => {
  const [searchInput, setSearchInput] = useState("vozidlo");
  return (
    <div className="flex flex-row justify-between whitespace-nowrap pb-1 pt-0.5 hover:shadow">
      <input
        className="flex-grow "
        onFocus={(e) => {
          e.target.select();
        }}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <button
        className="ml-2 flex flex-row px-1 pr-6"
        onClick={() => {
          props.onClickHandler(searchInput);
          setSearchInput("");
        }}
      >
        Search
      </button>
    </div>
  );
};
