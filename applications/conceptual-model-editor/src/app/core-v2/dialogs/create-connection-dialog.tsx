import { SemanticModelClass, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { getNameOf, getDescriptionOf } from "../util/utils";
import { Connection } from "reactflow";
import { ConnectionType } from "../util/connection";

export const useCreateConnectionDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const createConnectionDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [connectionCreated, setConnectionCreated] = useState(null as unknown as Connection);
    const [conn, setConn] = useState({
        connectionType: "association",
    } as ConnectionType);
    const [cardinality, setCardinality] = useState([0, null] as [number, number | null]);

    useEffect(() => {
        const { current: el } = createConnectionDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => setIsOpen(false);
    const open = (connection: Connection) => {
        setConnectionCreated(connection);
        setIsOpen(true);
    };

    const onCardinalityChange = (cardinality: [number, number | null]) => {
        setCardinality(cardinality);
    };
    const isCardinalitySelected = (
        value: [number, number | null] | undefined,
        cardinality: [number, number | null]
    ) => {
        if (!value) {
            return false;
        }
        return value[0] == cardinality[0] && value[1] == cardinality[1];
    };

    const RadioField = (props: { label: string; checked: boolean; card: [number, number | null] }) => (
        <div>
            <input
                type="radio"
                id={`cardinality-${props.label}`}
                name="cardinality"
                value={props.label}
                checked={props.checked}
                onChange={() => onCardinalityChange(props.card)}
            />
            <label htmlFor={`cardinality-${props.label}`}>{props.label}</label>
        </div>
    );

    const CreateConnectionDialog = () => {
        if (!connectionCreated) {
            close();
            return <></>;
        }
        const { source, target } = connectionCreated;
        if (!source || !target) {
            close();
            return <></>;
        }
        return (
            <dialog ref={createConnectionDialogRef} className="z-50 flex h-96 w-96 flex-col justify-between">
                <div>
                    <h5>{`Connection from: ${source} to: ${target}`}</h5>
                    <p className=" text-gray-500">{/* {props.cls.iri} */}</p>
                </div>
                <p>
                    type:{" "}
                    <span
                        onClick={() =>
                            setConn({ connectionType: "association", ends: [{} as SemanticModelRelationshipEnd] })
                        }
                        className={conn.connectionType == "association" ? "text-black" : "text-gray-400"}
                    >
                        association
                    </span>
                    <span>|</span>
                    <span
                        onClick={() =>
                            setConn({ connectionType: "generalization", childEntityId: source, parentEntityId: target })
                        }
                        className={conn.connectionType == "generalization" ? "text-black" : "text-gray-400"}
                    >
                        generalization
                    </span>
                </p>
                {conn.connectionType == "association" && (
                    <p>
                        cardinality-source:
                        <div className="flex flex-row [&]:font-mono">
                            <RadioField
                                label="0..*"
                                checked={isCardinalitySelected(cardinality, [0, null])}
                                card={[0, null]}
                            />
                            <RadioField
                                label="1..*"
                                checked={isCardinalitySelected(cardinality, [1, null])}
                                card={[1, null]}
                            />
                            <RadioField
                                label="0..1"
                                checked={isCardinalitySelected(cardinality, [0, 1])}
                                card={[0, 1]}
                            />
                            <RadioField
                                label="1..1"
                                checked={isCardinalitySelected(cardinality, [1, 1])}
                                card={[1, 1]}
                            />
                        </div>
                    </p>
                )}
                <p>description: todo</p>
                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            // console.log(newName, newIri, newDescription);
                            // props.save({ name: { cs: newName }, iri: newIri, description: { cs: newDescription } });
                            close();
                        }}
                    >
                        confirm
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </dialog>
        );
    };

    return {
        isCreateConnectionDialogOpen: isOpen,
        closeCreateConnectionDialog: close,
        openCreateConnectionDialog: open,
        CreateConnectionDialog,
    };
};
