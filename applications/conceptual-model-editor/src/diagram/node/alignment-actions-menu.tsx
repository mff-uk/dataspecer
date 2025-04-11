import { CanvasMenuContentProps } from "../canvas/canvas-menu-props";
import { DiagramContext } from "../diagram-controller";
import { useContext } from "react";
import { t } from "../../application";
import { AlignmentHorizontalPosition, AlignmentVerticalPosition } from "../../action/align-nodes";

/**
 * This is react component representing toolbar menu, which represents alignment options
 * That is for horizontal alignment - left/mid/right
 * and for vertical alignment - top/mid/bot
 */
export function AlignmentMenu(_: { menuProps: CanvasMenuContentProps }) {
  const context = useContext(DiagramContext);
  const onHorizontalAlign = (alignmentHorizontalPosition: AlignmentHorizontalPosition) =>
    context?.callbacks().onAlignSelectionHorizontally(alignmentHorizontalPosition);
  const onVerticalAlign = (alignmentVerticalPosition: AlignmentVerticalPosition) =>
    context?.callbacks().onAlignSelectionVertically(alignmentVerticalPosition);

  // The svgs can be found here https://www.svgrepo.com/svg/535125/align-left

  return <div className="flex flex-col bg-white border-2 border-slate-400 border-solid [&>*]:px-5 [&>*]:text-left">
      <button className="flex py-1.5 hover:bg-gray-100"
              onClick={() => onHorizontalAlign(AlignmentHorizontalPosition.Left)}
              title={t("align-left.title")}>
        <svg width="24px" height="24px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1H3V15H1V1Z" fill="#000000"/>
          <path d="M5 13H15V9H5V13Z" fill="#000000"/>
          <path d="M11 7H5V3H11V7Z" fill="#000000"/>
        </svg>
        <p className="ml-2">{t("align-left.text")}</p>
      </button>
      <HorizontalSeparator></HorizontalSeparator>
      <button className="flex py-1.5 hover:bg-gray-100"
              onClick={() => onHorizontalAlign(AlignmentHorizontalPosition.Mid)}
              title={t("align-horizontal-mid.title")}>
          <svg width="24px" height="24px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 0H7V3H4V7H12V3H9V0Z" fill="#000000"/>
            <path d="M1 13V9H15V13H9V16H7V13H1Z" fill="#000000"/>
          </svg>
          <p className="ml-2">{t("align-horizontal-mid.text")}</p>
      </button>
      <HorizontalSeparator></HorizontalSeparator>
      <button className="flex py-1.5 hover:bg-gray-100"
              onClick={() => onHorizontalAlign(AlignmentHorizontalPosition.Right)}
              title={t("align-right.title")}>
        <svg width="24px" height="24px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 1H13V15H15V1Z" fill="#000000"/>
          <path d="M11 13H1V9H11V13Z" fill="#000000"/>
          <path d="M5 7H11V3H5V7Z" fill="#000000"/>
        </svg>
        <p className="ml-2">{t("align-right.text")}</p>
      </button>
      <HorizontalSeparatorStrong></HorizontalSeparatorStrong>
      <button className="flex py-1.5 hover:bg-gray-100"
              onClick={() => onVerticalAlign(AlignmentVerticalPosition.Top)}
              title={t("align-top.title")}>
        <svg width="24px" height="24px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 1V3L1 3V1H15Z" fill="#000000"/>
          <path d="M13 5V15H9L9 5H13Z" fill="#000000"/>
          <path d="M7 11L7 5H3L3 11H7Z" fill="#000000"/>
        </svg>
        <p className="ml-2">{t("align-top.text")}</p>
      </button>
      <HorizontalSeparator></HorizontalSeparator>
      <button className="flex py-1.5 hover:bg-gray-100"
              onClick={() => onVerticalAlign(AlignmentVerticalPosition.Mid)}
              title={t("align-vertical-mid.title")}>
        <svg width="24px" height="24px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7H13V1H9L9 15H13V9H16V7Z" fill="#000000"/>
          <path d="M7 12H3V9H0V7H3V4L7 4L7 12Z" fill="#000000"/>
        </svg>
        <p className="ml-2">{t("align-vertical-mid.text")}</p>
      </button>
      <HorizontalSeparator></HorizontalSeparator>
      <button className="flex py-1.5 hover:bg-gray-100"
              onClick={() => onVerticalAlign(AlignmentVerticalPosition.Bot)}
              title={t("align-bot.title")}>
        <svg width="24px" height="24px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 11V1H9L9 11H13Z" fill="#000000"/>
          <path d="M15 15V13L1 13V15L15 15Z" fill="#000000"/>
          <path d="M7 5L7 11H3L3 5H7Z" fill="#000000"/>
        </svg>
        <p className="ml-2">{t("align-bot.text")}</p>
      </button>
    </div>;
}


const HorizontalSeparator = () => <hr className="h-0.5 border-none bg-slate-300" />;
const HorizontalSeparatorStrong = () => <hr className="h-1 border-none bg-slate-300" />;