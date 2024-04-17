import { lng } from "@/Dir";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { modelTypeToName } from "@/known-models";
import { BetterModalProps } from "@/lib/better-modal";
import { ResourcesContext, requestLoadPackage } from "@/package";
import { LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { doLayout } from "@dataspecer/layout";
import { Loader } from "lucide-react";
import { useContext, useState } from "react";

export const Autolayout = ({ iri, isOpen, resolve, parentIri }: { iri: string, parentIri: string } & BetterModalProps<boolean>) => {
  const resources = useContext(ResourcesContext);
  const resource = resources[iri]!;
  const modelVisualizationId = iri + "/visualization";
  const modelVisualizationResource = resources[modelVisualizationId];

  const [isLoading, setIsLoading] = useState(false);
  const execute = async () => {
    setIsLoading(true);
    const response = await fetch(import.meta.env.VITE_BACKEND + "/resources/blob?iri=" + encodeURIComponent(iri));
    const data = await response.json();
    const entities = data.entities;

    let visualEntities;
    try {
      visualEntities = await doLayout(entities);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    const visualizationModel = {
      modelColors: {
        [iri]: "#ffd670",
      },
      modelId: modelVisualizationId,
      type: "http://dataspecer.com/resources/local/visual-model",
      visualEntities,
    };

    if (!modelVisualizationResource) {
      await fetch(import.meta.env.VITE_BACKEND + "/resources?parentIri=" + encodeURIComponent(parentIri), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          iri: modelVisualizationId,
          type: LOCAL_VISUAL_MODEL,
          userMetadata: {
            label: {
              cs: "Vygenerovaný autolayout",
            }
          }
        }),
      });
      await requestLoadPackage(parentIri, true);
    }

    await fetch(import.meta.env.VITE_BACKEND + "/resources/blob?iri=" + encodeURIComponent(modelVisualizationId), {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(visualizationModel),
    });
    setIsLoading(false);
  };

  const name = lng(resource.userMetadata?.description);
  const type = modelTypeToName[resource.types?.[0]];

  return (
    <Modal open={isOpen} onClose={() => isLoading ? null : resolve(false)}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Autolayout</ModalTitle>
          <ModalDescription>
            Spustí layout z @dataspecer/layout pro <strong>{type}</strong>{name && <> s názvem <strong>{name}</strong></>}.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="default" onClick={execute} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Spustit
          </Button>
          <Button variant="outline" onClick={() => resolve(false)} disabled={isLoading}>Zavřít</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}