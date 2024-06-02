import { randomBytes } from "crypto";

export const getRandomName = (length = 12) => {
    return randomBytes(length).toString("hex");
};
