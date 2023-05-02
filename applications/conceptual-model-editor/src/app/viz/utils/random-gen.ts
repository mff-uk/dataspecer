import { randomBytes } from "crypto";
import { Position } from "../layout/cim-layout";

export const getRandomPosition = (xMax: number = 1500, yMax: number = 600) => {
    return { x: getRandomNumberInRange(0, xMax), y: getRandomNumberInRange(0, yMax) } as Position;
};

export const getRandomName = () => {
    return randomBytes(12).toString("hex");
};

export const getRandomNumberInRange = (min: number, max: number) => {
    //  get number between min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
