import JSZip from 'jszip';
import { generateApp } from './api';
import { AxiosResponse, HttpStatusCode } from 'axios';

export async function downloadGeneratedZip(zipName: string, fileContent: string): Promise<Blob | null> {

    const response: AxiosResponse<Buffer, any> = await generateApp(zipName, fileContent);

    if (response.status === HttpStatusCode.InternalServerError) {
        return null;
    }

    const zip = await new JSZip().loadAsync(response.data);
    return await zip.generateAsync({ type: "blob" });
}
