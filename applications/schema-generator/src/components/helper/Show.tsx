export const Show: React.FC<{when: boolean}> = ({when, children}) => <div style={{display: when ? "block" : "none"}}>{children}</div>
