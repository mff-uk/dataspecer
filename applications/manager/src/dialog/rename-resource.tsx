import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BetterModalProps } from "@/lib/better-modal"
import { LanguageString } from "@dataspecer/core/core/core-resource"
import _uniqueId from 'lodash/uniqueId'
import { Plus, X } from "lucide-react"
import { useLayoutEffect, useState } from "react"

interface LS {
  key: string;
  lang: string;
  value: string;
}

type RenameResourceDialogProps = {
  inputLabel?: LanguageString,
  inputDescription?: LanguageString,
  type?: "edit" | "create"
} & BetterModalProps<{
  name: LanguageString,
  description: LanguageString
} | null>;


export const RenameResourceDialog = ({ inputLabel, inputDescription, isOpen, resolve, type }: RenameResourceDialogProps) => {
  type = type ?? "edit";

  const [labels, setLabels] = useState<LS[]>(() => {
    if (inputLabel && Object.keys(inputLabel).length > 0) {
      return Object.entries(inputLabel).map(([lang, value]) => ({ lang, value, key: _uniqueId() }));
    }
    return [{ lang: "cs", value: "", key: _uniqueId() }];
  });
  const [description, setDescription] = useState<LS[]>(() => {
    if (inputDescription && Object.keys(inputDescription).length > 0) {
      return Object.entries(inputDescription).map(([lang, value]) => ({ lang, value, key: _uniqueId() }));
    }
    return [{ lang: "cs", value: "", key: _uniqueId() }];
  });

  useLayoutEffect(() => {
    if (isOpen) {
      window.requestAnimationFrame(() => document.getElementById(labels[0].key)?.focus());
    }
  }, []);

  const removeName = (key: string) => {
    let newNames = labels.filter(i => i.key !== key);
    if (newNames.length === 0) {
      newNames.push({ lang: "cs", value: "", key: _uniqueId() });
    }
    setLabels(newNames);
  }

  const removeDescription = (key: string) => {
    let newDescription = description.filter(i => i.key !== key);
    if (newDescription.length === 0) {
      newDescription.push({ lang: "cs", value: "", key: _uniqueId() });
    }
    setDescription(newDescription);
  }

  const closeWithSuccess = () => {
    const outputName: LanguageString = Object.fromEntries(labels.filter(n => n.lang.length && n.value.length).map(n => [n.lang, n.value]));
    const outputDescription: LanguageString = Object.fromEntries(description.filter(n => n.lang.length && n.value.length).map(n => [n.lang, n.value]));
    resolve({ name: outputName, description: outputDescription });
  }

  return (
    <Modal open={isOpen} onClose={() => resolve(null)}>
      <ModalContent className="sm:max-w-[700px]">
        <ModalHeader>
          <ModalTitle>{type === "create" ? "Name" : "Rename"} the resource</ModalTitle>
          <ModalDescription>
            Please {type === "create" ? "select" : "change"} the name and the description of the resource.
          </ModalDescription>
        </ModalHeader>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => setLabels([...labels, { lang: "cs", value: "", key: _uniqueId() }])}><Plus className="mr-2 h-4 w-4" /> Add name</Button>
          <Button variant="ghost" onClick={() => setDescription([...description, { lang: "cs", value: "", key: _uniqueId() }])}><Plus className="mr-2 h-4 w-4" /> Add description</Button>
        </div>
        <div className="grid gap-4">
          {labels.map(name => (
            <div key={name.key} className="grid grid-cols-4  gap-2">
              <Label htmlFor={name.key} className="text-right flex grow-3 items-baseline gap-2 justify-end">
                <div>
                  Name:
                </div>
                <Input value={name.lang} placeholder="xx" onChange={target => setLabels([...labels.map(n => n === name ? { ...n, lang: target.target.value } : n)])} className="w-[1cm] text-center border-none p-0" />
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input id={name.key} value={name.value} className="grow" onChange={target => setLabels([...labels.map(n => n === name ? { ...n, value: target.target.value } : n)])} />
                <Button variant={"ghost"} size="icon" onClick={() => removeName(name.key)}>
                  <X className="text-muted-foreground" size={16} />
                </Button>
              </div>
            </div>
          ))}

          {description.map(name => (
            <div key={name.key} className="grid grid-cols-4 gap-2">
              <Label htmlFor={name.key} className="text-right flex grow-3 items-baseline gap-2 justify-end">
                <div>
                  Description:
                </div>
                <Input value={name.lang} placeholder="xx" onChange={target => setDescription([...description.map(n => n === name ? { ...n, lang: target.target.value } : n)])} className="w-[1cm] text-center border-none p-0" />
              </Label>
              <div className="col-span-3 flex gap-2">
                <Textarea id={name.key} value={name.value} className="grow" onChange={target => setDescription([...description.map(n => n === name ? { ...n, value: target.target.value } : n)])} />
                <Button variant={"ghost"} size="icon" onClick={() => removeDescription(name.key)}>
                  <X className="text-muted-foreground" size={16} />
                </Button>
              </div>
            </div>
          ))}
          <button type="submit" className="hidden" />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => resolve(null)}>Cancel</Button>
          <Button type="submit" onClick={closeWithSuccess}>Save changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}