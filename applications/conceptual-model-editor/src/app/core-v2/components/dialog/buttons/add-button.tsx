export const AddButton = (props: { onClick?: () => void; disabled?: boolean; title?: string; style?: string }) => {
    return (
        <button
            className={`bg-slate-100 p-2 text-green-700 hover:shadow-sm ${props.style}`}
            disabled={props.disabled}
            title={props.title}
            onClick={props.onClick}
        >
            ✅ add
        </button>
    );
};
