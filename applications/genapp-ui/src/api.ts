import axios, { AxiosResponse } from "axios";

const backendHost: string = import.meta.env.VITE_APP_BACKEND;

export const generateApp = (zipName: string, graphFileContent: string): Promise<AxiosResponse<Buffer, any>> => {

    const url = `${backendHost}/generate-app?zipname=${zipName}`;
    return axios
        .post<any, AxiosResponse<Buffer, any>>(
            url,
            { serializedGraph: graphFileContent },
            { responseType: "arraybuffer" }
        );
}