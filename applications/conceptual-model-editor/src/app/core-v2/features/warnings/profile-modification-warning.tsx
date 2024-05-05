export const ProfileModificationWarning = (props: { changedFields: string[] }) => (
    <div className="italic text-orange-600">
        Changing {props.changedFields.join(", ")} can introduce a breaking change.
    </div>
);
