import React from "react";


export function stopPropagation<E extends React.MouseEvent>(f: ((e: E) => void) | undefined = undefined) {
  return (e: E) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    f?.(e);
  };
}export function preventDefault<E extends React.SyntheticEvent>(f: ((e: E) => void) | undefined = undefined) {
  return (e: E) => {
    e.preventDefault();
    f?.(e);
  };
}

