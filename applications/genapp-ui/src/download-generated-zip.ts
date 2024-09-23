import JSZip from 'jszip';
import { generateApp } from './api';
import { AxiosResponse } from 'axios';

export async function downloadGeneratedZip(zipName: string, fileContent: string): Promise<Blob> {

    const response: AxiosResponse<Buffer, any> = await generateApp(zipName, fileContent);

    const zip = await new JSZip().loadAsync(response.data);
    return zip.generateAsync({ type: "blob" });
}
