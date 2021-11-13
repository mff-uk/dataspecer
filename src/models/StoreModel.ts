import { v4 as uuidv4 } from 'uuid';
import path from "path";
import {rm, readFile, writeFile, access} from "fs/promises";

export class StoreModel {
    private storage: string;

    constructor(storage: string) {
        this.storage = storage;
    }

    async create(): Promise<string> {
        const name = uuidv4();
        await writeFile(this.getStorePath(name) as string, "{}");
        return name;
    }

    async remove(id: string) {
        const path = this.getStorePath(id);
        if (path) {
            await access(path);
            await rm(path, {force: true});
        }
    }

    async get(id: string): Promise<Buffer | null> {
        const path = this.getStorePath(id);
        if (path) {
            try {
                return await readFile(path);
            } catch (e) {
            }
        }
        return null;
    }

    async set(id: string, payload: string) {
        const path = this.getStorePath(id);
        if (path) {
            try {
                await access(path);
                return await writeFile(path, payload);
            } catch (e) {
            }
        }
    }

    private getStorePath(unsafeId: string): string | null {
        if (!/^[a-zA-Z0-9-]+$/.test(unsafeId)) {
            return null;
        } else {
            return path.join(this.storage, unsafeId);
        }
    }
}
