import {useCallback, useEffect, useState} from "react";

/**
 * Similar to `useState`, but when initialValue is changed, the new value is changed as well and immediately.
 * @param initialValue
 */
export const useStateWithMutableInitial = <T>(initialValue: T): [T, (newValue: T) => void] => {
  const [value, setValue] = useState<{ value: T, lastInitialValue: T }>({value: initialValue, lastInitialValue: initialValue});
  useEffect(() => {
    if (value.lastInitialValue !== initialValue) {
      setValue({value: initialValue, lastInitialValue: initialValue});
    }
  }, [initialValue, value]);
  if (initialValue !== value.lastInitialValue) { // Immediate value change before the useEffect applies changes
    value.value = initialValue;
  }
  return [value.value, useCallback((newValue: T) => setValue({ value: newValue, lastInitialValue: initialValue }) , [initialValue])];
};
