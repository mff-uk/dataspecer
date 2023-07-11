import { PimClass } from "@dataspecer/core/pim/model";
import { LocalChangeType, useLocalChangesContext } from "../hooks/use-local-changes-context";
import { useViewLayoutContext } from "../view-layout";

const HtmlClassVis = (props: { cls: PimClass }) => {
    const cls = props.cls;
    const { colorOfClass } = useViewLayoutContext();
    const { changeClass, classHasChanged } = useLocalChangesContext();

    const handleEdit = () => {
        // remove class from adapter?
        // add class to local vocabulary?
        // keep attributes
        changeClass(cls, LocalChangeType.RENAME);
    };

    return (
        <div className="m-1 bg-white">
            <div className="flex flex-row justify-between">
                <h1 className=" overflow-x-hidden whitespace-nowrap">
                    {cls.pimHumanLabel?.cs || cls.pimHumanLabel?.en || "missing label"}
                </h1>
                <div className={"h-4 w-4 " + (classHasChanged(cls) ? "bg-red-500" : colorOfClass(cls))} />
            </div>

            <p className="overflow-x-clip">{cls.iri}</p>
            <p>{cls.pimExample}</p>
            <button className="text-slate-500" onClick={handleEdit}>
                edit
            </button>
        </div>
    );
};

export const HtmlVisualisation = () => {
    const { viewLayout } = useViewLayoutContext();

    return (
        <div>
            <h1>HtmlVis</h1>
            <div className="grid grid-cols-3  bg-slate-50">
                {[...viewLayout.elementPositionMap.entries()].map(([cls]) => (
                    <HtmlClassVis cls={cls} key={cls.iri} />
                ))}
            </div>
        </div>
    );
};
