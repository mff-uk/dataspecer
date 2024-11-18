
import { cn } from "./style";

const TAB_ACTIVE_CLASSNAME = "text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 border-blue-600 dark:border-blue-500";

const TAB_INACTIVE_CLASSNAME = "dark:border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300";

/**
 * A presentation container for tabs.
 */
export const Tabs = (props: {
  children: React.ReactNode | React.ReactNode[],
}) => {
  return (
    <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
        {props.children}
      </ul>
    </div>
  );
};

export const Tab = (props: {
  children: string | React.ReactNode
  /**
   * Truw when tab is active.
   */
  active: boolean,
  /**
   * Called when user click the tab.
   */
  onClick: () => void,
}) => {

  return (
    <li className="me-2">
      <button
        className={cn(
          "inline-block p-4 border-b-2 rounded-t-lg",
          props.active ? TAB_ACTIVE_CLASSNAME : TAB_INACTIVE_CLASSNAME
        )}
        data-tabs-target="#styled-profile"
        type="button"
        role="tab"
        aria-selected={props.active}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    </li>
  );
};
