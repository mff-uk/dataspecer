export const EdgeNameLabel = (props: { name: string | null; isProfile: boolean | undefined }) => {
    const { name, isProfile } = props;

    return (
        <div className="nopan bg-slate-200 hover:cursor-pointer" style={{ pointerEvents: "all" }}>
            {isProfile && <span>{"<profile>"}</span>}
            {name}
        </div>
    );
};
