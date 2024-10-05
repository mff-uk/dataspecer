// TODO: Actually I don't really like the union here (we have to convert the string value back to the enum value, if we want to use Enum somewhere)
// TODO: So maybe just do the classic ... type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";
export enum DIRECTION {
    UP = "UP",
    RIGHT = "RIGHT",
    DOWN = "DOWN",
    LEFT = "LEFT"
}