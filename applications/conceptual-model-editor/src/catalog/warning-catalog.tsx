import { WarningRow } from "./warning-catalog-row";
import { useWarningsContext } from "../context/warnings-context";

export const WarningCatalog = () => {
    const { warnings } = useWarningsContext();

    return (
        <ul className="h-full bg-orange-100">
            {warnings.map((w) => <WarningRow key={w.id} warning={w} />)}
        </ul>
    );
};
