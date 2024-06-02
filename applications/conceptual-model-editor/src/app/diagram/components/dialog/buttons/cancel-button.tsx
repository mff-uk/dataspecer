export const CancelButton = (props: { onClick: () => void }) => (
    <button className="bg-slate-100 p-2 text-red-700 hover:shadow-sm" onClick={props.onClick}>
        ❌ cancel
    </button>
);
