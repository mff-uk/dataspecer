
/**
 * Runtime preferences that can be changed by the user.
 * Unlike options, they are not provided using React context.
 *
 * As a result, the should not be used to long-time living UI,
 * where change on one place in the application can trigger change in other
 * part of the application.
 *
 * The preferences are saved using sessionStorage.
 */
export interface Preferences {

}
