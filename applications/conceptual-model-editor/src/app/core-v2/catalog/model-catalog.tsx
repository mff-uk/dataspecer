import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createSgovModel, createRdfsModel, ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useModelGraphContext } from "../context/model-context";
import { useAddModelDialog } from "../dialog/add-model-dialog";
import { ModelItemRow } from "../components/catalog-rows/model-item-row";

export const ModelCatalog = () => {
    const { aggregator, setAggregatorView, addModelToGraph, models } = useModelGraphContext();
    const { isAddModelDialogOpen, AddModelDialog, openAddModelDialog } = useAddModelDialog();

    const handleAddModel = async (modelType: "local" | "sgov") => {
        if (modelType == "sgov") {
            const model = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
            model.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
            model.allowClass("https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba");
            addModelToGraph(model);
            // } else if (modelType === DCTERMS_MODEL_ID) {
            //     const model = await createRdfsModel(
            //         ["https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl"],
            //         httpFetch
            //     );
            //     model.fetchFromPimStore();
            //     addModelToGraph(model);
        } else if (modelType == "local") {
            const model = new InMemorySemanticModel();
            addModelToGraph(model);
        } else {
            alert(`unsupported model type ${modelType}`);
            return;
        }

        const aggregatedView = aggregator.getView();
        setAggregatorView(aggregatedView);
    };

    const hasSgov = () => {
        const m = [...models.values()].find((m) => m instanceof ExternalSemanticModel);
        if (!m) {
            return false;
        }
        return true;
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
            className="cursor-pointer border bg-indigo-600 px-1 text-white disabled:cursor-default disabled:bg-zinc-500"
        >
            + <span className="font-mono">Model</span>
        </button>
    );

    const AddModelButton = (props: { disabled?: boolean; modelType: "local" | "sgov" }) => (
        <button
            onClick={() => handleAddModel(props.modelType)}
            disabled={props.disabled}
            type="button"
            className="cursor-pointer border bg-indigo-600 px-1 text-white disabled:cursor-default disabled:bg-zinc-500"
        >
            + <span className="font-mono">{props.modelType}</span>
        </button>
    );

    return (
        <>
            <div className="min-w-24 overflow-y-scroll bg-teal-100 px-1">
                <h3 className="font-semibold">Model catalog</h3>
                <ul>
                    {[...models.keys()].map((modelId, index) => (
                        <li key={"model" + index}>
                            <ModelItemRow modelId={modelId} />
                        </li>
                    ))}
                </ul>
                <div className="flex flex-row [&>*]:mr-1">
                    <AddModelDialogButton />
                    <AddModelButton disabled={hasSgov()} modelType="sgov" />
                    <AddModelButton modelType="local" />
                </div>
            </div>
            {isAddModelDialogOpen && <AddModelDialog />}
        </>
    );
};
