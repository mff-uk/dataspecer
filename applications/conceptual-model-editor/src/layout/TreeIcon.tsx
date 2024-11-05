// Taken and modified from https://codesandbox.io/p/sandbox/reactflow-elkjs-repositioning-tailwindcss-react-typescript-w1un1l?file=%2Fsrc%2FTreeIcon.tsx%3A19%2C15 together with the css

import React from "react";
export type DIRECTION_STRING = "UP" | "DOWN" | "LEFT" | "RIGHT";

export default function TreeIcon(props: { direction: DIRECTION_STRING }) {
    const direction = props.direction;
  const isRight = direction === "RIGHT";
  const isLeft = direction === "LEFT";
  const isDown = direction === "DOWN";

  let className = "";
  if(isLeft) {
    className = "-rotate-90";
  }
  else if(isRight) {
    className = "rotate-90";
  }
  else if(isDown) {
    className = "rotate-180";
  }


  return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        version="1.1"
        viewBox="0 0 16 16"
        height="1.25em"
        width="1.25em"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M15.25 12h-0.25v-3.25c0-0.965-0.785-1.75-1.75-1.75h-4.25v-2h0.25c0.412 0 0.75-0.338 0.75-0.75v-2.5c0-0.413-0.338-0.75-0.75-0.75h-2.5c-0.412 0-0.75 0.337-0.75 0.75v2.5c0 0.412 0.338 0.75 0.75 0.75h0.25v2h-4.25c-0.965 0-1.75 0.785-1.75 1.75v3.25h-0.25c-0.412 0-0.75 0.338-0.75 0.75v2.5c0 0.412 0.338 0.75 0.75 0.75h2.5c0.413 0 0.75-0.338 0.75-0.75v-2.5c0-0.412-0.337-0.75-0.75-0.75h-0.25v-3h4v3h-0.25c-0.412 0-0.75 0.338-0.75 0.75v2.5c0 0.412 0.338 0.75 0.75 0.75h2.5c0.412 0 0.75-0.338 0.75-0.75v-2.5c0-0.412-0.338-0.75-0.75-0.75h-0.25v-3h4v3h-0.25c-0.412 0-0.75 0.338-0.75 0.75v2.5c0 0.412 0.338 0.75 0.75 0.75h2.5c0.412 0 0.75-0.338 0.75-0.75v-2.5c0-0.412-0.338-0.75-0.75-0.75zM3 15h-2v-2h2v2zM9 15h-2v-2h2v2zM7 4v-2h2v2h-2zM15 15h-2v-2h2v2z"></path>
      </svg>
  );
}
