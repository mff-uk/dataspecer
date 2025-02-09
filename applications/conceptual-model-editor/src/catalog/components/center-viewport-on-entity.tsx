import { useState } from "react";

export const MoveViewportToEntityButton = (props: { onClick: (entityNumberToBeCentered: number) => void }) => {
  const [currentEntityNumber, setCurrentEntityNumber] = useState<number>(0)
  const onClickHandler = () => {
    props.onClick(currentEntityNumber);
    setCurrentEntityNumber(prev => prev + 1);
  };

  return (
    <button
      className="hover:bg-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
      title="Move viewport's center on entity"
      onClick={onClickHandler}
    >
            🎯
    </button>
  );
};
