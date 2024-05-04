import { ReactNode } from "react";

export const DialogDetailRow = (props: {
    detailKey: string;
    detailValue: JSX.Element | string | null;
    style?: string;
}) => {
    const { detailKey, detailValue, style } = props;
    return (
        <>
            <div className="font-semibold">{detailKey}:</div>
            <div className={style}>{detailValue}</div>
        </>
    );
};

export const DialogDetailRow2 = (props: { detailKey: string; children: ReactNode; style?: string }) => {
    const { detailKey, style, children } = props;
    return (
        <>
            <div className="font-semibold">{detailKey}:</div>
            <div className={style}>{children}</div>
        </>
    );
};
