export const ProfileModificationWarning = (props: { changedFields: string[] }) => (
    <div className="italic text-red-600">
        Changing {props.changedFields.join(", ")} can introduce a breaking change in the profile.
    </div>
);
