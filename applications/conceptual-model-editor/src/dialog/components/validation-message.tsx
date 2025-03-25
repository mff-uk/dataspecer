import { t } from "../../application";
import { Level, ValidationState } from "../utilities/validation-utilities"

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
        {t(message.message, ...message.args)}
      </div>
    )
  case Level.ERROR:
    return (
      <div className="text-red-600">
        {t(message.message, ...message.args)}
      </div>
    )
  }
}
