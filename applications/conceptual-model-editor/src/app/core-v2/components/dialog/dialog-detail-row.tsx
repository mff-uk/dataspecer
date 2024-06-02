import type { ReactNode } from "react";

export const DialogDetailRow = (props: { detailKey: string; children: ReactNode; style?: string }) => {
    const { detailKey, style, children } = props;
    return (
        <>
            <div className="font-semibold">{detailKey}:</div>
            <div className={style}>{children}</div>
        </>
    );
};
