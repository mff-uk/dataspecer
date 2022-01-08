import axios from "axios";
import {processEnv} from "../index";

export class BikeshedGenerator {
    public async generate(source: string): Promise<string | null> {
        const result = await axios.post(`${processEnv.REACT_APP_BACKEND}/transformer/bikeshed`, source, {
            headers: {
                "Content-Type": "text/plain",
            },
        });

        if (result.status !== 200) {
            return null;
        }

        return result.data;
    }
}
