import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createSgovModel, createRdfsModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useModelGraphContext } from "../context/model-context";
import { useAddModelDialog } from "../dialog/add-model-dialog";
import { SGOV_MODEL_ID, DCTERMS_MODEL_ID, LOCAL_MODEL_ID } from "../util/constants";
import { shortenStringTo } from "../util/utils";
import { useState } from "react";

export const ModelCatalog = () => {
    const {
        aggregator,
        aggregatorView,
        setAggregatorView,
        addModelToGraph,
        models,
        removeModelFromModels,
        setModelAlias,
    } = useModelGraphContext();
    const { isAddModelDialogOpen, AddModelDialog, openAddModelDialog } = useAddModelDialog();

    const handleAddModel = async (modelType: string) => {
        if (modelType === SGOV_MODEL_ID) {
            const model = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
            model.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
            model.allowClass("https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");
            addModelToGraph(model);
        } else if (modelType === DCTERMS_MODEL_ID) {
            const model = await createRdfsModel(
                ["https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl"],
                httpFetch
            );
            model.fetchFromPimStore();
            addModelToGraph(model);
        } else if (modelType === LOCAL_MODEL_ID) {
            const model = new InMemorySemanticModel();
            addModelToGraph(model);
        } else {
            alert(`unsupported model type ${modelType}`);
            return;
        }

        const aggregatedView = aggregator.getView();
        setAggregatorView(aggregatedView);
    };

    const AddModelDialogButton = () => (
        <button
            onClick={() =>
                openAddModelDialog((ttlFiles: string[]) => {
                    const cb = async () => {
                        const model = await createRdfsModel(ttlFiles, httpFetch);
                        model.fetchFromPimStore();
                        addModelToGraph(model);
                        const aggregatedView = aggregator.getView();
                        setAggregatorView(aggregatedView);
                    };
                    cb();
                })
            }
            disabled={isAddModelDialogOpen}
            type="button"
            className="cursor-pointer border bg-indigo-600 text-white disabled:cursor-default disabled:bg-zinc-500"
        >
            + <span className="font-mono">Model</span>
        </button>
    );

    const AddModelButton = (props: { disabled: boolean; modelType: string }) => (
        <button
            onClick={() => handleAddModel(props.modelType)}
            disabled={props.disabled}
            type="button"
            className="cursor-pointer border bg-indigo-600 text-white disabled:cursor-default disabled:bg-zinc-500"
        >
            + <span className="font-mono">{props.modelType}</span>
        </button>
    );

    const ModelItem = (props: { modelId: string }) => {
        const model = models.get(props.modelId);

        const modelAlias = model?.getAlias();
        const displayName = modelAlias ?? shortenStringTo(props.modelId);

        const [editing, setEditing] = useState(false);
        const [newAlias, setNewAlias] = useState(modelAlias);

        const reset = () => {
            setNewAlias(modelAlias);
            setEditing(false);
        };

        const saveAlias = () => {
            if (!model) {
                return;
            }
            console.log("saving new alias", newAlias, " to model ", model);
            setModelAlias(newAlias ?? null, model);
        };

        return (
            <div className="m-2 flex flex-row justify-between">
                <div className="flex flex-row">
                    <div>Ⓜ</div>
                    {editing ? (
                        <input
                            autoFocus
                            onFocus={(e) => e.target.select()}
                            value={newAlias ?? displayName}
                            disabled={!editing}
                            onChange={(e) => setNewAlias(e.target.value)}
                            onBlur={() => {
                                saveAlias();
                                reset();
                            }}
                            onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                    saveAlias();
                                    reset();
                                }
                                if (e.key === "Escape") {
                                    reset();
                                }
                            }}
                        />
                    ) : (
                        // <div>bob</div>
                        <div>{displayName}</div>
                    )}
                </div>
                <div>
                    <button className="hover:shadow-sm" onClick={() => setEditing(true)}>
                        ✏
                    </button>
                    <button className="my-auto" onClick={() => removeModelFromModels(props.modelId)}>
                        🗑️
                    </button>
                </div>
            </div>
        );
    };

    console.log("rerender");

    return (
        <>
            <div className="min-w-24 overflow-y-scroll bg-teal-100">
                <h3 className="font-semibold">Add Model Section</h3>
                <ul>
                    {[...models.keys()].map((modelId, index) => (
                        <li key={"model" + index}>
                            <ModelItem modelId={modelId} />
                        </li>
                    ))}
                </ul>
                <AddModelDialogButton />
                <AddModelButton disabled={models.has(SGOV_MODEL_ID)} modelType={SGOV_MODEL_ID} />
                <AddModelButton disabled={models.has(DCTERMS_MODEL_ID)} modelType={DCTERMS_MODEL_ID} />
                <AddModelButton disabled={false} modelType={LOCAL_MODEL_ID} />
            </div>
            {isAddModelDialogOpen && <AddModelDialog />}
        </>
    );
};
