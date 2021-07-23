/**
 * PSM level represent model on a platform specific level. It can represent,
 * for example, a specific file format.
 *
 * The PSM level classes does not automatically have all properties of
 * their PIM interpretations. They need to be added explicitly.
 *
 * When it comes to class "extends" it works in the same way as on the PIM,
 * level so in a transparent fashion.
 */
export * from "./psm-association-end";
export * from "./psm-attribute";
export * from "./psm-choice";
export * from "./psm-class";
export * from "./psm-include";
export * from "./psm-schema";
