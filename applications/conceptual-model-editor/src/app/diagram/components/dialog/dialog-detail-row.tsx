import type { ReactNode } from "react";

// TODO Rename style to className to be consistent.
export const DialogDetailRow = (props: { detailKey: string; children: ReactNode; style?: string}) => {
    const { detailKey, style, children } = props;
    return (
        <>
            <div className="font-semibold">{detailKey}:</div>
            <div className={style}>{children}</div>
        </>
    );
};
