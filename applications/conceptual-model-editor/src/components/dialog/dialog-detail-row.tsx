import type { ReactNode } from "react";

export const DialogDetailRow = (props: { detailKey: string; children: ReactNode; className?: string}) => {
    const { detailKey, className, children } = props;
    return (
        <>
            <div className="font-semibold">{detailKey}:</div>
            <div className={className}>{children}</div>
        </>
    );
};
