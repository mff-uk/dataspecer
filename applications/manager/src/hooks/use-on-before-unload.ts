import { useEffect } from "react";

export function useOnBeforeUnload(isActive: boolean, text: string = "Please make sure you have saved your work before leaving this page.") {
  useEffect(() => {
    if (isActive) {
      window.onbeforeunload = () => text;
      return () => {
        window.onbeforeunload = null;
      };
    }
  }, [isActive, text]);
}
