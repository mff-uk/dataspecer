import { lng } from "@/Dir";
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModelIcon, createModelInstructions, modelTypeToName } from "@/known-models";
import { ResourcesContext } from "@/package";
import { useCallback, useContext, useState } from "react";

export const CreateNew = ({ isOpen, close, iri }: { isOpen: boolean, close: () => void, iri: string }) => {
  const resource = useContext(ResourcesContext)[iri]!;

  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const selectModel = useCallback((modelType: string) => {
    setSelectedModel(modelType);
  }, []);
  const selectName = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const name = ((e.target as HTMLFormElement).elements.namedItem("name") as HTMLInputElement).value;
    createModelInstructions[selectedModel!].createHook({
      iri: "",
      parentIri: iri,
      modelType: selectedModel!,
      name,
    }).then(() => {
      close();
    });
  }, [selectedModel, close]);

  return (
    <Modal open={isOpen} onOpenChange={(value: boolean) => value ? null : close()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Create new</ModalTitle>
          <ModalDescription>
            Create a new package/model under <i>{lng(resource.userMetadata?.label) ?? modelTypeToName[resource.types?.[0]]}</i>.
          </ModalDescription>
        </ModalHeader>
        {!selectedModel &&
          <ModalBody className="mt-auto flex flex-col gap-2 p-4">
            {Object.keys(createModelInstructions).map(modelType => <Button onClick={() => selectModel(modelType)} variant={"outline"} key={modelType}><ModelIcon type={[modelType]} className="mr-2 h-4 w-4" /> {modelTypeToName[modelType]}</Button>)}
          </ModalBody>
        }
        {selectedModel &&
            <form onSubmit={selectName}>
              <ModalBody>

              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" />
              </div>
              </ModalBody>
          <ModalFooter>
              <Button type="submit">Create</Button>
          </ModalFooter>
            </form>
        }
      </ModalContent>
    </Modal>
  );
};