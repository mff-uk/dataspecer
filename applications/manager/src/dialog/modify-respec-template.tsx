import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal";
import { MonacoEditor } from "@/components/monaco-editor";
import { Button } from "@/components/ui/button";
import { BetterModalProps } from "@/lib/better-modal";
import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from "react";

export const ModifyRespecTemplate = ({ isOpen, resolve, iri, blobName, defaultContent }: { iri: string, blobName: string, defaultContent: string } & BetterModalProps) => {
  const monaco = useRef<{editor: monaco.editor.IStandaloneCodeEditor}>(undefined);

  const [data, setData] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    (async () => {
      const response = await fetch(import.meta.env.VITE_BACKEND + "/resources/blob?iri=" + encodeURIComponent(iri) + "&name=" + encodeURIComponent(blobName));
      if (!response.ok) return null;
      return (await response.json()).value ?? null;
    })().then(setData);
  }, []);

  const save = async () => {
    const value = monaco.current!.editor.getValue();
    if (value === defaultContent) {
      await fetch(import.meta.env.VITE_BACKEND + "/resources/blob?iri=" + encodeURIComponent(iri) + "&name=" + encodeURIComponent(blobName), {
        method: "DELETE",
      });
    } else {
      await fetch(import.meta.env.VITE_BACKEND + "/resources/blob?iri=" + encodeURIComponent(iri) + "&name=" + encodeURIComponent(blobName), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({value}),
      });
    };
  };

  return (
    // Forbid modal auto close
    <Modal open={isOpen} onOpenChange={state => state || resolve()}>
      <ModalContent className="max-w-none h-[100%]">
        <ModalHeader>
          <ModalTitle>Modify Respec Template</ModalTitle>
        </ModalHeader>
        <ModalBody className="overflow-hidden grow flex flex-col">
          {data !== undefined && <MonacoEditor refs={monaco} defaultValue={data ?? defaultContent} language="handlebars" />}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => resolve()}>Cancel</Button>
          <Button variant="outline" onClick={() => save()}>Save</Button>
          <Button variant="default" onClick={() => save().then(resolve)}>Save & Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};