import { useWarningsContext } from "../context/warnings-context";

export const WarningCatalog = () => {
    const { warnings } = useWarningsContext();
    return (
        <ul className="h-full bg-orange-100">
            {warnings.map((w) => (
                <li key={w.id} className="flex flex-row">
                    <div className="font-mono font-semibold">{w.type}</div>
                    <div className="ml-1 flex-grow text-clip">{w.message}</div>
                    <button title="log to console" onClick={() => console.log("warning: ", w)}>
                        👁
                    </button>
                </li>
            ))}
        </ul>
    );
};
