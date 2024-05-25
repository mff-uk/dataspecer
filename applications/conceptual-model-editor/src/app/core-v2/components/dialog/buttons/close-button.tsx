export const CloseButton = (props: { onClick: () => void }) => (
    <button className="bg-slate-100 p-2 hover:shadow-sm" onClick={props.onClick}>
        close
    </button>
);
