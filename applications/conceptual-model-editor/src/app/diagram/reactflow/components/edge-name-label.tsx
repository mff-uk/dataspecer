export const EdgeNameLabel = (props: { name: string | null; isProfile: boolean | undefined; hasParents: string[] }) => {
    const { name, isProfile, hasParents } = props;
    const parentsLength = hasParents.length;
    const showParents = parentsLength > 0;
    const showDots = parentsLength > 1;

    return (
        <div className="nopan flex flex-col bg-slate-200 hover:cursor-pointer" style={{ pointerEvents: "all" }}>
            {isProfile && <span>{"<profile>"}</span>}
            <span>{name}</span>
            {showParents && (
                <span>
                    <span className="text-sm">subPropOf:</span> {hasParents.at(0)}
                    {showDots && ", ..."}
                </span>
            )}
        </div>
    );
};
