import { t } from "../../application";

export const CreateProfileButton = ({ onClickHandler }: { onClickHandler?: () => void }) => {
  if (onClickHandler === undefined) {
    return null;
  }
  return (
    <button
      className={"hover:bg-teal-400"}
      title={t("create-profile-button.title")}
      onClick={onClickHandler}
    >
            🧲
    </button>
  );
};
