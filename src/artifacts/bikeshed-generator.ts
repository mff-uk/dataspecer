import axios from "axios";

export class BikeshedGenerator {
    public async generate(source: string): Promise<string | null> {
        const result = await axios.post(`${process.env.REACT_APP_BACKEND}/transformer/bikeshed`, source, {
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
