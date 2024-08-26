import { t } from "../../application/";

export const CreateProfileButton = ({ onClickHandler }: { onClickHandler?: () => void }) => {

    // TODO Is this needed?
    const hasHandler = onClickHandler !== undefined;

    const title = hasHandler
        ? t("create-profile-button.title")
        : t("create-profile-button.title.missing-handler");

    return (
        <button
            className={`hover:bg-teal-400 ${hasHandler ? "" : "opacity-30"}`}
            title={title}
            onClick={onClickHandler}
        >
            🧲
        </button>
    );
};
