import { lng } from "@/Dir";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { usePreviousValue } from "@/hooks/use-previous-value";
import { modelTypeToName } from "@/known-models";
import { BetterModalProps } from "@/lib/better-modal";
import { ResourcesContext, deleteResource } from "@/package";
import { Loader } from "lucide-react";
import { useContext, useState } from "react";

export const DeleteResource = ({ iri, isOpen, resolve }: { iri: string } & BetterModalProps<boolean>) => {
  const resources = useContext(ResourcesContext);
  const resource = usePreviousValue(resources[iri]!);

  const [isLoading, setIsLoading] = useState(false);
  const doDelete = async () => {
    setIsLoading(true);
    await deleteResource(iri);
    resolve(true);
  }

  const name = lng(resource.userMetadata?.description);
  const type = modelTypeToName[resource.types?.[0]];

  return (
    <Modal open={isOpen} onClose={() => isLoading ? null : resolve(false)}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Odstranění modelu</ModalTitle>
          <ModalDescription>
            Chystáte se odstranit <strong>{type}</strong>{name && <> s názvem <strong>{name}</strong></>}. Tento krok je nevratný.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="destructive" onClick={doDelete} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Odstranit
          </Button>
          <Button variant="outline" onClick={() => resolve(false)} disabled={isLoading}>Zavřít</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}