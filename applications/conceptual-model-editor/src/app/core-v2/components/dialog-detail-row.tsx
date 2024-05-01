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
