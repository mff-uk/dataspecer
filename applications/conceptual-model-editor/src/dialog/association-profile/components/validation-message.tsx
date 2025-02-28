import { t } from "../../../application";
import { Level, ValidationState } from "../../utilities/validation-utilities"

export const ValidationMessage = (props: {
  value: ValidationState,
}) => {
  const { message } = props.value;
  if (message === null) {
    return null;
  }
  switch (message.level) {
  case Level.INFO:
    return (
      <div>
        {t(message.message, ...message.args)}
      </div>
    )
  case Level.WARNING:
    return (
      <div className="text-orange-600">
        <span className="font-bold">{t("warning")}</span>:&nbsp;
        {t(message.message, ...message.args)}
      </div>
    )
  case Level.ERROR:
    return (
      <div className="text-red-600">
        <span className="font-bold">{t("error")}</span>:&nbsp;
        {t(message.message, ...message.args)}
      </div>
    )
  }
}
