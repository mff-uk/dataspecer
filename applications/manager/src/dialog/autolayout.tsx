import { lng } from "@/Dir";
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { modelTypeToName } from "@/known-models";
import { BetterModalProps } from "@/lib/better-modal";
import { ResourcesContext, requestLoadPackage } from "@/package";
import { LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { performLayoutOfSemanticModel } from "@dataspecer/layout";
import { Loader } from "lucide-react";
import { useContext, useState } from "react";
import { useConfigDialog } from "./layout-dialog";


export const Autolayout = ({ iri, isOpen, resolve, parentIri }: { iri: string, parentIri: string } & BetterModalProps<boolean>) => {
  const resources = useContext(ResourcesContext);
  const resource = resources[iri]!;
  const baseModelVisualizationId = iri + "/visualization";

  let modelVisualizationId = baseModelVisualizationId;
  let modelVisualizationResource = resources[modelVisualizationId];
  let lastModelVisualizationId = baseModelVisualizationId;
  let lastModelVisualizationResource = resources[modelVisualizationId];

  const [shouldCreateNewModel, setShouldCreateNewModel] = useState(true);

  let index = 0;
  while(modelVisualizationResource) {
    index++;

    lastModelVisualizationId = modelVisualizationId;
    lastModelVisualizationResource = modelVisualizationResource;

    modelVisualizationId = `${baseModelVisualizationId}-${index}`;
    modelVisualizationResource = resources[modelVisualizationId];
  }

  // Take the last used model
  if(!shouldCreateNewModel) {
    modelVisualizationId = lastModelVisualizationId;
    modelVisualizationResource = lastModelVisualizationResource;
  }


  const [isLoading, setIsLoading] = useState(false);
  const execute = async () => {
    setIsLoading(true);
    const response = await fetch(import.meta.env.VITE_BACKEND + "/resources/blob?iri=" + encodeURIComponent(iri));
    const data = await response.json();
    const entities = data.entities;
    const semanticModelId = data.modelId;

    console.log(entities);
    console.log(semanticModelId);
    console.info("resources");
    console.info(resources);
    console.info(resource);

    let visualEntities;
    try {
      visualEntities = await performLayoutOfSemanticModel(entities, semanticModelId, getValidConfig());
      console.info("layouted visual entitites");
      console.info(visualEntities);
      throw new Error("Implementation of layout is not ready");
    } catch (error) {
      alert("LAYOUT WAS NOT SUCCESSFUL");
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
              en: "Generated autolayout",
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


  const { getValidConfig, ConfigDialog } = useConfigDialog();

  return (
    <Modal open={isOpen} onClose={() => isLoading ? null : resolve(false)}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Autolayout (Work in progress - sometimes crashes, etc.)</ModalTitle>
          <ModalDescription>
           Launches layout from @dataspecer/layout for <strong>{type}</strong>{name && <> with name <strong>{name}</strong></>}.
            {/* cz: Spustí layout z @dataspecer/layout pro <strong>{type}</strong>{name && <> s názvem <strong>{name}</strong></>}. */}
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className='h-8'>------------------------</div>
          <input type="checkbox" id="checkbox-shouldCreateNewModel" name="checkbox-shouldCreateNewModel" checked={shouldCreateNewModel}
                      onChange={(e => setShouldCreateNewModel(e.target.checked))} />
          <label htmlFor="checkbox-shouldCreateNewModel" className="font-black">Create new visual model (If unchecked then last layouted visual model is overridden [i.e. destroyed])
            { /* cz: Vytvoř nový vizuální model (při nezaškrtnutí se přepíše poslední layout model) */}</label>
          <div className='h-8'></div>
          <div>------------------------</div>
          <ConfigDialog></ConfigDialog>
        </ModalBody>
        <ModalFooter>
          <Button variant="default" onClick={execute} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Launch{/* cz: Spustit */}
          </Button>
          <Button variant="outline" onClick={() => resolve(false)} disabled={isLoading}>Close{/* cz: Zavřít */}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
