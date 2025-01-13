// Taken and modified from https://codesandbox.io/p/sandbox/reactflow-elkjs-repositioning-tailwindcss-react-typescript-w1un1l?file=%2Fsrc%2FTreeIcon.tsx%3A19%2C15 together with the css

export type DirectionString = "UP" | "DOWN" | "LEFT" | "RIGHT";

export default function TreeIcon(props: { direction: DirectionString }) {
  const direction = props.direction;
  const isRight = direction === "RIGHT";
  const isLeft = direction === "LEFT";
  const isDown = direction === "DOWN";

  const translateForCentering = "translate-y-0.5"
  let className = translateForCentering;
  if(isLeft) {
    className = `-rotate-90 ${translateForCentering}`;
  }
  else if(isRight) {
    className = `rotate-90 ${translateForCentering}`;
  }
  else if(isDown) {
    className = `rotate-180 ${translateForCentering}`;
  }

  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      version="1.1"
      viewBox="0 0 511.404 511.404"
      height="1.25em"
      width="1.25em"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >

      {/* https://www.svgrepo.com/svg/238436/multiply */}
      <path d="M447.702,383.403v-42.667c0-58.816-47.851-106.667-106.667-106.667h-64v-64h64c7.872,0,15.104-4.331,18.816-11.264    c3.712-6.955,3.307-15.36-1.067-21.909l-85.333-128c-7.915-11.861-27.584-11.861-35.499,0l-85.333,128    c-4.373,6.549-4.779,14.955-1.067,21.909c3.712,6.933,10.944,11.264,18.816,11.264h64v64h-64    c-58.816,0-106.667,47.851-106.667,106.667v42.667c-23.531,0-42.667,19.136-42.667,42.667v42.667    c0,23.531,19.136,42.667,42.667,42.667h42.667c23.531,0,42.667-19.136,42.667-42.667V426.07c0-23.531-19.136-42.667-42.667-42.667    v-42.667c0-35.285,28.715-64,64-64h64v106.667c-23.531,0-42.667,19.136-42.667,42.667v42.667    c0,23.531,19.136,42.667,42.667,42.667h42.667c23.531,0,42.667-19.136,42.667-42.667V426.07c0-23.531-19.136-42.667-42.667-42.667    V276.736h64c35.285,0,64,28.715,64,64v42.667c-23.531,0-42.667,19.136-42.667,42.667v42.667c0,23.531,19.136,42.667,42.667,42.667    h42.667c23.531,0,42.667-19.136,42.667-42.667V426.07C490.369,402.539,471.233,383.403,447.702,383.403z"/>
    </svg>
  );
}
