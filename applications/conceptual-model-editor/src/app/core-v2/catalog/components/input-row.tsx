import { useState } from "react";

export const InputEntityRow = (props: { onClickHandler: (search: string) => void }) => {
    const [searchInput, setSearchInput] = useState("vozidlo");
    return (
        <div className="flex flex-row justify-between whitespace-nowrap pb-1 hover:shadow">
            <input
                onFocus={(e) => {
                    e.target.select();
                }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
                className="ml-2 flex flex-row bg-teal-300 px-1 pr-6"
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
