import { randomBytes } from "crypto";

export const getRandomName = (length = 12) => {
    return randomBytes(length).toString("hex");
};

export const getRandomNumberInRange = (min: number, max: number) => {
    //  get number between min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
