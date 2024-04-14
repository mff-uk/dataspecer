import { lng } from "@/Dir";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModelIcon, createModelInstructions, modelTypeToName } from "@/known-models";
import { cn } from "@/lib/utils";
import { ResourcesContext } from "@/package";
import { useCallback, useContext, useEffect, useState } from "react";

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

  // todo: cleanup
  useEffect(() => {
    if (!isOpen) {
      setSelectedModel(undefined);
    }
  }, [isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={(value: boolean) => value ? null : close()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create new</DrawerTitle>
          <DrawerDescription>
            Create a new package/model under <i>{lng(resource.userMetadata?.label) ?? modelTypeToName[resource.types?.[0]]}</i>.
          </DrawerDescription>
        </DrawerHeader>
        {!selectedModel &&
          <DrawerFooter>
            {Object.keys(createModelInstructions).map(modelType => <Button onClick={() => selectModel(modelType)} variant={"outline"} key={modelType}><ModelIcon type={[modelType]} className="mr-2 h-4 w-4" /> {modelTypeToName[modelType]}</Button>)}
          </DrawerFooter>
        }
        {selectedModel &&
          <DrawerFooter>
            <form className={cn("grid items-start gap-4")} onSubmit={selectName}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" />
              </div>
              <Button type="submit">Create</Button>
            </form>
          </DrawerFooter>
        }
      </DrawerContent>
    </Drawer>
  );
};