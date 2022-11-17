import { ReactNode } from "react";

export const Show: React.FC<{when: boolean, children: ReactNode}> = ({when, children}) => <div style={{display: when ? "block" : "none"}}>{children}</div>
