import "./node-secondary-toolbar.css";
import { CanvasToolbarGeneralProps } from "../canvas/canvas-toolbar-props";

export function SecondaryNodeToolbar({ value }: { value: CanvasToolbarGeneralProps | null }) {
    if(value === null || value.toolbarType !== "NODE-SECONDARY-TOOLBAR") {
        return null;
    }

    const onShowSelectionActions = () => alert("Show selection");
    const onLayoutSelection = () => alert("layout");
    const onCreateGroup = () => alert("group");
    const onShowExpandSelection = () => alert("expand");
    const onShowFilterSelection = () => alert("filter");


    // const isVisible = props.selected === true && props.data.isLastSelected;

    // const isLastSelected = props.selected === true && context?.getLastSelected() === props.id;
    // return (<>
    // <NodeToolbar isVisible={isLastSelected} position={Position.Top} className="flex gap-2 node-secondary-toolbar" >
    //     <button onClick={onShowSelectionActions}>🎬</button>
    //     &nbsp;
    //     <button onClick={onLayoutSelection}>🔀</button>
    //     &nbsp;
    // </NodeToolbar>
    // <NodeToolbar isVisible={isLastSelected} position={Position.Right} className="flex gap-2 node-secondary-toolbar" >
    // <button onClick={onCreateGroup}>🤝</button>
    // </NodeToolbar>
    // <NodeToolbar isVisible={isLastSelected} position={Position.Bottom} className="flex gap-2 node-secondary-toolbar" >
    //     <button onClick={onShowExpandSelection}>📈</button>
    //     &nbsp;
    //     <button onClick={onShowFilterSelection}>📉</button>
    //     &nbsp;
    // </NodeToolbar>
    // </>
    // );

    return (<>
        <ul className="node-secondary-toolbar">
            <li>
                <button onClick={onShowSelectionActions}>🖼️</button>
            </li>
            <li>
                <button onClick={onLayoutSelection}>🧲</button>
            </li>
            <li>
                <button onClick={onCreateGroup}>🕶️</button>
            </li>
            <li>
                <button onClick={onShowExpandSelection}>🗑️</button>
            </li>
        </ul>
    </>);
  }