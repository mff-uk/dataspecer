import type { Warning } from "../context/warnings-context";

export const WarningRow = (props: { warning: Warning }) => {
    const { warning } = props;
    return (
        <li key={warning.id} className="flex flex-row">
            <div className="font-mono font-semibold">{warning.type}</div>
            <div className="ml-1 flex-grow text-clip">{warning.message}</div>
            <button title="log to console" onClick={() => console.log("warning: ", warning)}>
                👁
            </button>
        </li>
    );
};
