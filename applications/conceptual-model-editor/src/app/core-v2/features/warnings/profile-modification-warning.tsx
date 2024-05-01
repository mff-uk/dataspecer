export const ProfileModificationWarning = (props: { changedFields: string[] }) => (
    <div className="italic">Changing {props.changedFields.join(", ")} can introduce a breaking change.</div>
);
