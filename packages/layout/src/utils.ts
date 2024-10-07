// TODO: Actually I don't really like the union here (we have to convert the string value back to the enum value, if we want to use Enum somewhere)
// TODO: So maybe just do the classic ... type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";
export enum DIRECTION {
    UP = "UP",
    RIGHT = "RIGHT",
    DOWN = "DOWN",
    LEFT = "LEFT"
}

export const xdd = () => {

}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}