import { t } from "../../../application";
import { ValidationState } from "../../utilities/validation-utilities"

export const ValidationMessage = (props: {
  value: ValidationState,
}) => {
  const { message } = props.value;
  if (message === null) {
    return null;
  }
  return (
    <div className="text-orange-600">
      <span className="font-bold">{t("warning")}</span>:&nbsp;
      {t(message.message, ...message.args)}
    </div>
  )
}
