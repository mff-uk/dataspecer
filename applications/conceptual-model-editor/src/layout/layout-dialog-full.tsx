import { useState } from "react";
import { useConfigDialog } from "./layout-dialog";
import { useActions } from "../action/actions-react-binding";

export const useLayoutDialog = () => {
  const { getValidConfig, ConfigDialog } = useConfigDialog();
  const actions = useActions();

  const onClickLayout = () => {
    actions.layoutActiveVisualModel(getValidConfig()).catch(console.warn).finally(() => close());
  };

  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState<boolean>(false);
  const open = () => {
    setIsLayoutDialogOpen(true);
  };
  const close = () => {
    setIsLayoutDialogOpen(false);
  };

  const DialogComponent = () => {
    // The max-h-full makes it finally react to situation when dialog doesn't fit
    return <dialog className="px-3 py-3 mt-[1vh] overflow-y-auto max-h-full" style={{ zIndex: 10000 }} open={isLayoutDialogOpen}>
      <ConfigDialog></ConfigDialog>
      <div className='h-2'></div>
      <button onClick={onClickLayout} className="bg-transparent hover:bg-green-700 text-green-900 font-semibold hover:text-white py-2 px-4 border border-green-900 hover:border-transparent rounded">Layout</button>
      <button onClick={close} className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded">Close</button>
    </dialog>;
  };

  return {
    open,
    close,
    isLayoutDialogOpen,
    DialogComponent
  };
};
