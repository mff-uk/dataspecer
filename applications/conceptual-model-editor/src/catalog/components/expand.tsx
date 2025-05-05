export const ExpandButton = (props: { isExpanded?: boolean; onClickHandler?: () => void }) => {
  const { isExpanded, onClickHandler } = props;
  return (
    <button className="ml-0.5 hover:bg-teal-400" title="load surroundings" onClick={onClickHandler}>
      {!isExpanded ? "❌ " : "✅ "}
      Expand
    </button>
  );
};
