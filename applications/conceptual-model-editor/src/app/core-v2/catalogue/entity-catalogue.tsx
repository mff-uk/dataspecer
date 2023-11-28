import {
    SemanticModelClass,
    isSemanticModelClass,
    isSemanticModelRelationship,
    isSemanticModelGeneralization,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { useState, useEffect } from "react";
import { getRandomName } from "~/app/utils/random-gen";
import { useClassesContext, SemanticModelClassWithOrigin } from "../context/classes-context";
import { useModelGraphContext } from "../context/graph-context";
import { useVisualizationContext } from "../context/visualization-context";
import { useEntityDetailDialog } from "../dialogs/entity-detail-dialog";
import { useModifyEntityDialog } from "../dialogs/modify-entity-dialog";
import { colorForModel, getNameOf } from "../util/utils";
import { useViewContext } from "../context/view-context";

export const EntityCatalogue = () => {
    const { aggregatorView, models, addClassToLocalGraph, modifyClassInLocalModel } = useModelGraphContext();
    const { setClasses, classes, allowedClasses, setAllowedClasses, setRelationships, setGeneralizations } =
        useClassesContext();
    const [entityDetailSelected, setEntityDetailSelected] = useState(null as unknown as SemanticModelClass);
    const { hideOwlThing, setHideOwlThing } = useVisualizationContext();
    const { addClassToActiveView, classesAndPositions } = useViewContext();

    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();

    useEffect(() => {
        setClasses(
            new Map(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities())
                            .filter(isSemanticModelClass)
                            .map((c) => ({ cls: c, origin: modelId }))
                    )
                    .flat()
                    .map((cls) => [cls.cls.id, cls])
            )
        );
        setRelationships(
            [...models.keys()]
                .map((modelId) => Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelRelationship))
                .flat()
        );
        setGeneralizations(
            [...models.keys()]
                .map((modelId) =>
                    Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelGeneralization)
                )
                .flat()
        );

        // TODO: how to make sure that boxes get rendered on canvas after first model gets registered?
        const callToUnsubscribe = aggregatorView?.subscribeToChanges(() => {
            setClasses(
                new Map(
                    [...models.keys()]
                        .map((modelId) =>
                            Object.values(models.get(modelId)!.getEntities())
                                .filter(isSemanticModelClass)
                                .map((c) => ({ cls: c, origin: modelId }))
                        )
                        .flat()
                        .map((cls) => [cls.cls.id, cls])
                )
                // [...models.keys()]
                //     .map((modelId) =>
                //         Object.values(models.get(modelId)!.getEntities())
                //             .filter(isSemanticModelClass)
                //             .map((c) => ({ cls: c, origin: modelId }))
                //     )
                //     .flat()
            );
            setRelationships(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelRelationship)
                    )
                    .flat()
            );
            setGeneralizations(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelGeneralization)
                    )
                    .flat()
            );
        });
        return callToUnsubscribe;
    }, [models, aggregatorView]);

    const toggleAllow = async (modelId: string, classId: string) => {
        console.log("in toggle allow", aggregatorView);
        const model = models.get(modelId);
        if (!(model instanceof ExternalSemanticModel)) return;

        if (allowedClasses.includes(classId)) {
            setAllowedClasses(allowedClasses.filter((allowed) => allowed !== classId));
            await model.releaseClassSurroundings(classId);
        } else {
            setAllowedClasses([...allowedClasses, classId]);
            await model.allowClassSurroundings(classId);
        }
    };

    const handleOpenDetail = (cls: SemanticModelClass) => {
        console.log("in handle open detail for semantic model class", cls);
        setEntityDetailSelected(cls);
        openEntityDetailDialog();
    };

    const handleAddConcept = () => {
        const resultSuccess = addClassToLocalGraph({ cs: getRandomName(5), en: getRandomName(5) }, undefined);
        if (!resultSuccess) {
            alert("FIXME: something went wrong, class not added to local model");
        }
    };

    const handleOpenModification = (cls: SemanticModelClass) => {
        console.log("in handle open modification for semantic model class", cls);
        setEntityDetailSelected(cls);
        openModifyEntityDialog();
    };

    const handleModifyConcept = (cls: SemanticModelClass, entity: Partial<Omit<SemanticModelClass, "type" | "id">>) => {
        const resultSuccess = modifyClassInLocalModel(cls.id, entity); //{ cs: getRandomName(5), en: getRandomName(5) }, undefined);
        if (!resultSuccess) {
            alert("FIXME: something went wrong, class not added to local model");
        }
    };

    // classes from model
    const getClassesFromModel = (modelId: string) => {
        const model = models.get(modelId);
        let clses: JSX.Element[];
        if (model instanceof ExternalSemanticModel) {
            clses = [...classes.keys()]
                .map((classId) => classes.get(classId)!)
                .filter((cwo) => cwo.origin == modelId)
                .map((cwo) => (
                    <ExpandableRow cls={cwo} key={cwo.cls.id} toggleHandler={() => toggleAllow(modelId, cwo.cls.id)} />
                ));
        } else if (model instanceof InMemorySemanticModel) {
            clses = [...classes.keys()]
                .map((classId) => classes.get(classId)!)
                .filter((cwo) => cwo.origin == modelId)
                .map((cwo) => <ModifiableRow cls={cwo} key={cwo.cls.id} />)
                .concat(
                    <div key="add-a-concept-" className="flex flex-row justify-between whitespace-nowrap">
                        Add a concept
                        <button className="ml-2 bg-teal-300 px-1" onClick={handleAddConcept}>
                            Add
                        </button>
                    </div>
                );
        } else {
            clses = []; //classes.filter((v) => v.origin == modelId).map((v) => <NonExpandableRow cls={v} key={v.cls.id} />);
        }
        return (
            <li key={modelId} className={colorForModel.get(modelId) ?? "bg-fuchsia-800"}>
                <ul>{clses}</ul>
            </li>
        );
    };

    // components
    const ExpandableRow = (props: { cls: SemanticModelClassWithOrigin; toggleHandler: () => void }) => {
        const cls = props.cls.cls;
        return (
            <div className="flex flex-row justify-between whitespace-nowrap">
                <span onClick={props.toggleHandler}>
                    {allowedClasses.includes(cls.id) ? "✅ " : "❌ "}
                    {getNameOf(cls)}
                </span>
                <div className="ml-2 flex flex-row bg-teal-300 px-1">
                    <button onClick={() => handleOpenDetail(cls)}>Detail</button>
                    <button
                        className=" disabled:opacity-30"
                        disabled={classesAndPositions?.has(cls.id)}
                        onClick={() => addClassToActiveView(cls.id)}
                    >
                        👁️
                    </button>
                </div>
            </div>
        );
    };
    const NonExpandableRow = (props: { cls: SemanticModelClassWithOrigin }) => (
        <div className="flex flex-row justify-between whitespace-nowrap">
            {getNameOf(props.cls.cls)}
            <button className="ml-2 bg-teal-300 px-1" onClick={() => handleOpenDetail(props.cls.cls)}>
                Detail
            </button>
        </div>
    );
    const ModifiableRow = (props: { cls: SemanticModelClassWithOrigin }) => (
        <div className="flex flex-row justify-between whitespace-nowrap">
            {getNameOf(props.cls.cls)}
            <div className="bg-teal-300 px-1">
                <button className="ml-0.5" onClick={() => handleOpenModification(props.cls.cls)}>
                    Modify
                </button>
                <button className="ml-2" onClick={() => handleOpenDetail(props.cls.cls)}>
                    Detail
                </button>
                <button
                    className="disabled:opacity-30"
                    disabled={classesAndPositions?.has(props.cls.cls.id)}
                    onClick={() => addClassToActiveView(props.cls.cls.id)}
                >
                    👁️
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="h-full overflow-y-scroll">
                <div className="flex flex-row">
                    <h2>Classes:</h2>
                    <input
                        name="owl-thing-hidden"
                        type="radio"
                        onClick={() => setHideOwlThing((prev) => !prev)}
                        checked={hideOwlThing}
                    />

                    <label htmlFor="owl-thing-hidden"> hide owl:thing</label>
                </div>

                <ul>{[...models.keys()].map((modelId) => getClassesFromModel(modelId))}</ul>
            </div>
            {isEntityDetailDialogOpen && <EntityDetailDialog cls={entityDetailSelected} />}
            {isModifyEntityDialogOpen && (
                <ModifyEntityDialog
                    cls={entityDetailSelected}
                    save={(entity: Partial<Omit<SemanticModelClass, "type" | "id">>) =>
                        handleModifyConcept(entityDetailSelected, entity)
                    }
                />
            )}
        </>
    );
};
