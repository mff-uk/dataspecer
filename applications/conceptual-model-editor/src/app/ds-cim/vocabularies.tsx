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

const ClassFromInMemoryVocabulary = (props: { pimCls: PimClass; fromCim: NewCimAdapter }) => {
    const { addClassToView2 } = useViewLayoutContext();

    const { pimCls: cls, fromCim: cim } = props;

    return (
        <div className="flex flex-row justify-between">
            <div className=" whitespace-nowrap">{cls.pimHumanLabel?.cs ?? cls.iri?.slice(-15)}</div>
            <div>
                <span className="hover:cursor-pointer" onClick={() => addClassToView2(cls, cim)}>
                    🦥
                </span>
            </div>
        </div>
    );
};

const InMemoryVocabulary = (props: { adapter: NewCimAdapter }) => {
    const { classes2 } = useCimAdapterContext();
    const { classHasChanged } = useLocalChangesContext();
    const { cimColor } = useViewLayoutContext();

    return (
        <VocabularyTemplate icon="💾" label={props.adapter.getLabel()} color={cimColor(props.adapter)}>
            <ul className="bg-white">
                {classes2.get(props.adapter)?.map((cls) => {
                    if (classHasChanged(cls)) {
                        return <ChangedClass pimCls={cls} />;
                    }
                    return <ClassFromInMemoryVocabulary pimCls={cls} fromCim={props.adapter} key={cls.iri} />;
                })}
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
            <div className="overflow-x-hidden">{cls.pimHumanLabel?.cs ?? cls.iri?.slice(-15)}</div>
            <div>
                <span className="hover:cursor-pointer" onClick={() => addClassToView2(cls, cim)}>
                    🦥
                </span>
                <span className="hover:cursor-pointer" onClick={() => loadNeighbors(cls)}>
                    🔍
                </span>
            </div>
        </div>
    );
};

const ChangedClass = (props: { pimCls: PimClass }) => {
    const { pimCls: cls } = props;

    return (
        <div className="flex flex-row justify-between">
            <div className="overflow-x-hidden whitespace-nowrap line-through">
                {cls.pimHumanLabel?.cs ?? cls.iri?.slice(-15)}
            </div>
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
            <input
                placeholder="Seach a concept..." // FIXME: congigurable value
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === "Enter") searchButtonClickHandler();
                }}
            />
            <div onClick={searchButtonClickHandler}>🔍</div>
        </div>
    );
};

const ExternalVocabulary = (props: { adapter: NewCimAdapter }) => {
    const { classes2, searchClasses } = useCimAdapterContext();
    const { classHasChanged } = useLocalChangesContext();
    const { cimColor } = useViewLayoutContext();

    return (
        <VocabularyTemplate icon="⏳" label={props.adapter.getLabel()} color={cimColor(props.adapter)}>
            <ul className="bg-white">
                {classes2.get(props.adapter)?.map((cls) => {
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
            <input
                placeholder="iri"
                value={classProps.iri}
                onChange={(e) => setClassProps({ ...classProps, iri: e.target.value })}
            />
            <input
                placeholder="cs label"
                value={classProps.pimHumanLabel?.cs}
                onChange={(e) => setClassProps({ ...classProps, pimHumanLabel: { cs: e.target.value } })}
                onKeyUp={(e) => {
                    if (e.key === "Enter") props.handleClick(classProps);
                }}
            />
            <button onClick={() => props.handleClick(classProps)}>Create 🔧</button>
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
                                <div>
                                    {lc.onClass.pimHumanLabel?.cs || lc.onClass.pimHumanLabel?.en || lc.onClass.iri}
                                </div>
                                <div>
                                    <span
                                        className="hover:cursor-pointer"
                                        // TODO: decide on inner design
                                        // @ts-ignore not implemented yey
                                        onClick={() => addClassToView2(lc.onClass, null)}
                                    >
                                        🦥
                                    </span>
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
            <h1 className="text-xl">Vocabularies</h1>
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
