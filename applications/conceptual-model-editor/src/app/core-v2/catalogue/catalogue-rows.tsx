// import { SemanticModelClassWithOrigin } from "../context/classes-context";
// import { getNameOf } from "../util/utils";

// export const ExpandableRow = (props: { cls: SemanticModelClassWithOrigin; toggleHandler: () => void }) => {
//     const cls = props.cls.cls;
//     return (
//         <div className="flex flex-row justify-between whitespace-nowrap">
//             <span onClick={props.toggleHandler}>
//                 {allowedClasses.includes(cls.id) ? "✅ " : "❌ "}
//                 {getNameOf(cls)}
//             </span>
//             <button className="ml-2 bg-teal-300 px-1" onClick={() => handleOpenDetail(cls)}>
//                 Detail
//             </button>
//         </div>
//     );
// };
// export const NonExpandableRow = (props: { cls: SemanticModelClassWithOrigin }) => (
//     <div className="flex flex-row justify-between whitespace-nowrap">
//         {getNameOf(props.cls.cls)}
//         <button className="ml-2 bg-teal-300 px-1" onClick={() => handleOpenDetail(props.cls.cls)}>
//             Detail
//         </button>
//     </div>
// );
// export const ModifiableRow = (props: { cls: SemanticModelClassWithOrigin }) => (
//     <div className="flex flex-row justify-between whitespace-nowrap">
//         {getNameOf(props.cls.cls)}
//         <div>
//             <button className="ml-2 bg-teal-300 px-1" onClick={() => handleOpenModification(props.cls.cls)}>
//                 Modify
//             </button>
//             <button className="ml-0.5 bg-teal-300 px-1" onClick={() => handleOpenDetail(props.cls.cls)}>
//                 Detail
//             </button>
//         </div>
//     </div>
// );
