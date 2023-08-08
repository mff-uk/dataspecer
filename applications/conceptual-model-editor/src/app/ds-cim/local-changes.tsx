import { LocalChange, useLocalChangesContext } from "./hooks/use-local-changes-context";

const LocalChangeRow = (props: { localChange: LocalChange }) => {
    const { undoChange } = useLocalChangesContext();
    const lc = props.localChange;
    return (
        <div className="m-1 flex flex-row justify-between bg-white p-1">
            <section>
                <p>Action: {lc.action}</p>
                <p>On class: {lc.onClass.iri?.slice(-15)}</p>
            </section>
            <button title="undo this edit" onClick={() => undoChange(lc)}>
                👈
            </button>
        </div>
    );
};

export const LocalChanges = () => {
    const { localChanges } = useLocalChangesContext();
    return (
        <div className="bg-[#d9d9d9]">
            <h3>Local changes</h3>
            <div className="flex flex-col-reverse px-2 pb-2">
                {localChanges.map((lc) => (
                    <LocalChangeRow localChange={lc} />
                ))}
            </div>
        </div>
    );
};
