import { t } from "../../application";
import { DataspecerError } from "../../dataspecer/dataspecer-error";
import { UseNotificationServiceWriterType } from "../../notification/notification-service-context";

/**
 * Executes given function.
 * If operation fails, captures the exception and show notification.
 */
export function withErrorBoundary<T>(
  notifications: UseNotificationServiceWriterType,
  callback: () => T
): T | null {
  try {
    return callback();
  } catch (error) {
    if (error instanceof DataspecerError) {
      notifications.error(t(error.message, ...error.args));
    } else {
      // We shot general exception.
      notifications.error("Operation failed");
    }
    return null;
  }
}

export async function withAsyncErrorBoundary<T>(
  notifications: UseNotificationServiceWriterType,
  callback: () => Promise<T>
): Promise<T | null> {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof DataspecerError) {
      notifications.error(t(error.message, ...error.args));
    } else {
      // We shot general exception.
      notifications.error("Operation failed");
    }
    return null;
  }
}
