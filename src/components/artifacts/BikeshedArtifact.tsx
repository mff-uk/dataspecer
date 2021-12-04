import React from "react";
import {MemoryOutputStream} from "model-driven-data/io/stream/memory-output-stream";
import {webSpecificationToBikeshed, writeBikeshed} from "model-driven-data/bikeshed";
import {CoreResourceReader} from "model-driven-data/core";
import {constructDocumentationModel} from "./construct-documentation-model";

function openWindowWithPost(url: string, data: Record<string, string>) {
    const form = document.createElement("form");
    form.target = "_blank";
    form.method = "POST";
    form.action = url;
    form.style.display = "none";

    for (const key in data) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

async function generate(reader: CoreResourceReader, fromSchema: string): Promise<string> {
    const bikeshed = webSpecificationToBikeshed(await constructDocumentationModel(reader, fromSchema));
    const stream = new MemoryOutputStream();
    await writeBikeshed(bikeshed, stream);
    return stream.getContent();
}

export async function GetBikeshedArtifact(reader: CoreResourceReader, schema: string): Promise<string> {
    const bs = await generate(reader, schema);
    if (!bs) {
        throw new Error("No schema returned");
    }
    return bs;
}

export async function GetPreviewBikeshedArtifact(reader: CoreResourceReader, schema: string) {
    const bs = await generate(reader, schema);
    if (!bs) {
        throw new Error("No schema returned");
    }
    openWindowWithPost("https://api.csswg.org/bikeshed/", {
        text: bs,
        force: "1",
        input: "spec",
        output: "html",
        action: "Process",
    });
}
