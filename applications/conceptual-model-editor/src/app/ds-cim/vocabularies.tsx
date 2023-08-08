import React, { useEffect, useState } from "react";
import { useCimAdapterContext } from "./hooks/use-cim-adapter-context";
import {
    ExternalCimAdapter,
    InMemoryCimAdapter,
    LocalCimAdapter,
    getLocalCimAdapter,
} from "./cim-adapters/cim-adapters";
import { NewCimAdapter } from "./cim-adapters/cim-adapters";
import { PimClass } from "@dataspecer/core/pim/model";
import { useViewLayoutContext } from "./view-layout";
import { LocalChangeType, useLocalChangesContext } from "./hooks/use-local-changes-context";
import { getLabelOrIri } from "./utils/get-label-or-iri";

const AddAdapter = () => {
    return (
        <div className="m-2 bg-white">
            <button onClick={() => alert("FIXME: add new adapter dialog")}>+ Add adapter</button>
        </div>
    );
};

const VocabularyTemplate = (props: { icon: string; label: string; children: React.ReactNode; color?: string }) => {
    const [open, setOpen] = useState(false);
    const handleOpenCloseClick = () => {
        setOpen(!open);
    };

    return (
        <div className="m-2 bg-white">
            <div className="view-item-header flex flex-row justify-between">
                <div className="flex flex-row">
                    <div>{props.icon}</div>
                    <div>{props.label}</div>
                </div>
                <div className="flex flex-row">
                    <div className={"h-6 w-6 " + (props.color ?? "bg-slate-200")}></div>
                    <div onClick={handleOpenCloseClick}>{open ? "close" : "open"}</div>
                </div>
            </div>
            <div>{open && props.children}</div>
        </div>
    );
};

const TypeMarker = (props: { text: string }) => {
    return <span className="mx-1 text-xs font-thin">{props.text}</span>;
};

const ClassFromInMemoryVocabulary = (props: { pimCls: PimClass; fromCim: NewCimAdapter }) => {
    const { addClassToView2 } = useViewLayoutContext();
    const { getAttributesOfClass, getAssociationsOfClass } = useCimAdapterContext();
    const { pimCls: cls, fromCim: cim } = props;
    const [attributesExpanded, setAttributesExpanded] = useState(false);

    const expandAttributes = () => {
        setAttributesExpanded((previous) => !previous);
    };

    const attributesOfClass = getAttributesOfClass(cls);
    const associationsOfClass = getAssociationsOfClass(cls);

    return (
        <div>
            <div className="flex flex-row justify-between">
                <div className="flex items-center whitespace-nowrap">
                    <TypeMarker text="c" />
                    {getLabelOrIri(cls)}
                </div>
                <div className="flex flex-row">
                    {attributesOfClass.length + associationsOfClass.length > 0 && (
                        <button
                            title="expand attributes and associations"
                            onClick={expandAttributes}
                            className="  text-slate-500 "
                        >
                            expand
                        </button>
                    )}
                    <button title="add this class to current view" onClick={() => addClassToView2(cls, cim)}>
                        🦥
                    </button>
                    <button title="log this class to console" onClick={() => console.log(cls)}>
                        📝
                    </button>
                </div>
            </div>
            {attributesExpanded && (
                <div>
                    <div>
                        <ul>
                            {attributesOfClass.map((attr) => (
                                <li key={attr.iri} className="flex items-center bg-slate-100">
                                    <TypeMarker text="at" />
                                    {getLabelOrIri(attr)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <ul>
                            {associationsOfClass.map((assoc) => (
                                <li key={assoc.iri}>
                                    <TypeMarker text="as" />
                                    {getLabelOrIri(assoc)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const InMemoryVocabulary = (props: { adapter: NewCimAdapter }) => {
    const { classes, attributes, associations } = useCimAdapterContext();
    const { classHasChanged } = useLocalChangesContext();
    const { cimColor } = useViewLayoutContext();

    return (
        <VocabularyTemplate icon="💾" label={props.adapter.getLabel()} color={cimColor(props.adapter)}>
            classes: {classes.get(props.adapter)?.length}, attributes: {attributes.length}, associations:{" "}
            {associations.length}
            <ul className="bg-white">
                {classes.get(props.adapter)?.map((cls) => {
                    if (classHasChanged(cls)) {
                        return <ChangedClass pimCls={cls} />;
                    }
                    return <ClassFromInMemoryVocabulary pimCls={cls} fromCim={props.adapter} key={cls.iri} />;
                })}
            </ul>
            <ul className="bg-slate-50">
                {associations.map((association) => (
                    <li key={association.iri}>
                        <div className="flex flex-row justify-between">
                            <div className="flex items-center">
                                <TypeMarker text="as" />
                                <span>{getLabelOrIri(association)}</span>
                            </div>
                            <button title="log this association to console" onClick={() => console.log(association)}>
                                📝
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </VocabularyTemplate>
    );
};

const ClassFromExternalVocabulary = (props: { pimCls: PimClass; fromCim: NewCimAdapter }) => {
    const { loadNeighbors } = useCimAdapterContext();
    const { addClassToView2 } = useViewLayoutContext();

    const { pimCls: cls, fromCim: cim } = props;

    return (
        <div className="flex flex-row justify-between [&>div]:whitespace-nowrap">
            <div className="overflow-x-hidden">{getLabelOrIri(cls)}</div>
            <div>
                <button title="add this class to view" onClick={() => addClassToView2(cls, cim)}>
                    🦥
                </button>
                <button title="search for neighbors of this class" onClick={() => loadNeighbors(cls)}>
                    🔍
                </button>
            </div>
        </div>
    );
};

const ChangedClass = (props: { pimCls: PimClass }) => {
    const { pimCls: cls } = props;

    return (
        <div className="flex flex-row justify-between">
            <div className="overflow-x-hidden whitespace-nowrap line-through">{getLabelOrIri(cls)}</div>
            <div> 🙃 </div>
        </div>
    );
};

const FindClassRow = (props: { handleSearch: (s: string) => void }) => {
    const [text, setText] = useState("");

    const searchButtonClickHandler = () => {
        props.handleSearch(text);
        setText("");
    };

    return (
        <div className="flex flex-row">
            <input // TODO: sanitize
                placeholder="Search a concept..." // FIXME: configurable value
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === "Enter") searchButtonClickHandler();
                }}
            />
            <button title="search for class in this vocabulary" onClick={searchButtonClickHandler}>
                🔍
            </button>
        </div>
    );
};

const ExternalVocabulary = (props: { adapter: NewCimAdapter }) => {
    const { classes, searchClasses } = useCimAdapterContext();
    const { classHasChanged } = useLocalChangesContext();
    const { cimColor } = useViewLayoutContext();

    return (
        <VocabularyTemplate icon="⏳" label={props.adapter.getLabel()} color={cimColor(props.adapter)}>
            <ul className="bg-white">
                {classes.get(props.adapter)?.map((cls) => {
                    if (classHasChanged(cls)) {
                        return <ChangedClass pimCls={cls} />;
                    }
                    return <ClassFromExternalVocabulary pimCls={cls} fromCim={props.adapter} key={cls.iri} />;
                })}

                <li>
                    <FindClassRow handleSearch={searchClasses} />
                </li>
            </ul>
        </VocabularyTemplate>
    );
};

type CreateClassFields = {
    iri: string;
    pimHumanLabel: {
        cs?: string;
    };
};

const CreateNewClassDialog = (props: { handleClick: (c: CreateClassFields) => void }) => {
    const [classProps, setClassProps] = useState({
        iri: "https://example.com/my-fake-iri/",
        pimHumanLabel: {
            cs: "",
        },
    } as CreateClassFields);

    return (
        <div className="flex flex-col">
            <input // TODO: sanitize
                placeholder="iri"
                value={classProps.iri}
                onChange={(e) => setClassProps({ ...classProps, iri: e.target.value })}
            />
            <input // TODO: sanitize
                placeholder="cs label"
                value={classProps.pimHumanLabel?.cs}
                onChange={(e) => setClassProps({ ...classProps, pimHumanLabel: { cs: e.target.value } })}
                onKeyUp={(e) => {
                    if (e.key === "Enter") props.handleClick(classProps);
                }}
            />
            <button title="create a class" onClick={() => props.handleClick(classProps)}>
                Create 🔧
            </button>
        </div>
    );
};

const LocalVocabulary = (props: { adapter: LocalCimAdapter }) => {
    const { addClassToView2 } = useViewLayoutContext();
    const { localChanges, changeClass } = useLocalChangesContext();
    const [createNewClassDialogOpen, setCreateNewClassDialogOpen] = useState(false);

    const handleNewClassClick = (c: CreateClassFields) => {
        const newPimClass = new PimClass(c.iri);
        newPimClass.pimHumanLabel = c.pimHumanLabel;

        changeClass(newPimClass, LocalChangeType.CREATE);
        setCreateNewClassDialogOpen(false);
    };

    // FIXME: color system fix
    return (
        <VocabularyTemplate icon="📍" label={props.adapter.getLabel()} color="bg-red-500">
            <ul className="bg-white">
                {localChanges.map((lc) => {
                    return (
                        <li key={lc.onClass.iri}>
                            <div className="flex flex-row justify-between">
                                <div>{getLabelOrIri(lc.onClass)}</div>
                                <div>
                                    <button
                                        title="add this class to view"
                                        className="hover:cursor-pointer"
                                        // TODO: decide on inner design
                                        // @ts-ignore not implemented yey
                                        onClick={() => addClassToView2(lc.onClass, null)}
                                    >
                                        🦥
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
                <li>
                    <button
                        onClick={() => setCreateNewClassDialogOpen(true)}
                        className={createNewClassDialogOpen ? "text-slate-300 line-through" : ""}
                        disabled={createNewClassDialogOpen}
                    >
                        + Add a new class
                    </button>
                    {createNewClassDialogOpen && <CreateNewClassDialog handleClick={handleNewClassClick} />}
                </li>
            </ul>
        </VocabularyTemplate>
    );
};

export const Vocabularies = () => {
    const { cims, loadAllClasses } = useCimAdapterContext();
    const [localVocab, setLocalVocab] = useState(getLocalCimAdapter());

    // load all in memory classes right away
    useEffect(() => {
        cims.filter(InMemoryCimAdapter.is).forEach((cim) => loadAllClasses(cim));
    }, []);

    return (
        <div className="h-full overflow-y-scroll bg-[#d9d9d9]">
            <h1 className="ml-2 text-xl">Vocabularies</h1>
            <div>
                <AddAdapter />
                <div id="vocabulary-list">
                    {cims.map((cimAdapter) => {
                        if (InMemoryCimAdapter.is(cimAdapter)) {
                            return <InMemoryVocabulary key={cimAdapter.getId()} adapter={cimAdapter} />;
                        } else if (ExternalCimAdapter.is(cimAdapter)) {
                            return <ExternalVocabulary key={cimAdapter.getId()} adapter={cimAdapter} />;
                        }
                    })}
                    <LocalVocabulary adapter={localVocab} />
                </div>
            </div>
        </div>
    );
};
