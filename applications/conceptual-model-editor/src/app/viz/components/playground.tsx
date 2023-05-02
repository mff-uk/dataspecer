"use client";

import React, { createRef } from "react";
import ReactDOM from "react-dom";
import { CimAction, CimActionKind, CimDispatch, CimState, CimState2 } from "../cim-change-reducer";
import { DiaLibAdapter, DiaLibAdapterBuilder } from "../diagram-library-adapter";
import { JointJsAdapterBuilder } from "../jointjs-adapter";
import SyncDiaButton from "./sync-dia-button";

type PlaygroundProps = {
    cimState: CimState;
    cimDispatch: CimDispatch; // React.Dispatch<CimAction>;
};

type PlaygroundProps2 = {
    cimState: CimState2;
    cimDispatch: CimDispatch; // React.Dispatch<CimAction>;
};

// class Playground extends React.Component<PlaygroundProps> {
class Playground extends React.Component<PlaygroundProps2> {
    diaLibAdapterBuilder: DiaLibAdapterBuilder;
    diaLibAdapter!: DiaLibAdapter; // to be initialized
    childRef: React.RefObject<any>;
    // cimState: CimState;
    cimState: CimState2;
    cimDispatch: React.Dispatch<CimAction>;

    // constructor(props: PlaygroundProps) {
    constructor(props: PlaygroundProps2) {
        super(props);
        this.childRef = createRef();
        this.cimState = props.cimState;
        this.cimDispatch = props.cimDispatch;
        this.diaLibAdapterBuilder = new JointJsAdapterBuilder();
    }

    componentDidMount(): void {
        this.diaLibAdapterBuilder
            .cimState(this.cimState)
            .mountTo(ReactDOM.findDOMNode(this.childRef.current))
            .paperOptions({
                background: "#f9e7e7",
                height: 650,
                width: 1500,
            })
            .diagramSyncHandler(() => {
                this.cimDispatch({ type: CimActionKind.SYNC_DONE });
            });

        this.diaLibAdapter = this.diaLibAdapterBuilder.build();

        this.diaLibAdapter.setCimClassClickListener((cls) => {
            console.log("single click handler dispatched");

            this.cimDispatch({
                type: CimActionKind.ADD_ATTRIBUTE,
                clsId: cls.id,
                payload: {
                    name: `click${Date.now()}`,
                    value: "true",
                },
            });
        });

        this.diaLibAdapter.setOnBlankPaperClickHandler(() => {
            this.cimDispatch({ type: CimActionKind.REMOVE_FOCUS });
        });

        this.diaLibAdapter.setOnCimClassPositionChangeHandler((cls, position) => {
            this.cimDispatch({
                type: CimActionKind.ELEMENT_MOVE,
                clsId: cls.id,
                payload: {
                    position: position,
                },
            });
            console.log(cls, position);
        });

        this.diaLibAdapter.syncDiaToState();
    }

    render(): React.ReactNode {
        const syncDia = () => this.diaLibAdapter.syncDiaToState();

        return (
            <>
                <SyncDiaButton refresh={syncDia} />
                <div id="canvas420" ref={this.childRef} />
            </>
        );
    }
}

export default Playground;
