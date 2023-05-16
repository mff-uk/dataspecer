import { randomBytes } from "crypto";
import type { Position } from "../layout/cim-layout";

export const getRandomPosition = (xMax = 1500, yMax = 600) => {
    return { x: getRandomNumberInRange(0, xMax), y: getRandomNumberInRange(0, yMax) } as Position;
};

export const getRandomName = (length = 12) => {
    return randomBytes(length).toString("hex");
};

export const getRandomNumberInRange = (min: number, max: number) => {
    //  get number between min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
