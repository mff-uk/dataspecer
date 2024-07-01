import { lng } from "@/Dir";
import { Modal, ModalBody, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@/components/modal";
import { LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createModelInstructions, getCMELink } from "@/known-models";
import { BetterModalProps } from "@/lib/better-modal";
import { deleteResource, modifyUserMetadata } from "@/package";
import { LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { useState } from "react";
import { useTranslation } from "react-i18next";


export const Profile = ({ isOpen, resolve, iri }: { iri: string } & BetterModalProps<boolean>) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);

  const formSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setLoading(true);

    try {
      const url = (event.target as any)["url"].value;
  
      // Create package
      const packageIri = await createModelInstructions[LOCAL_PACKAGE].createHook({
        parentIri: iri,
        label: {},
        description: {},
      }) as string;
  
      // Import
      const importResult = await fetch(import.meta.env.VITE_BACKEND + "/resources/import?parentIri=" + encodeURIComponent(packageIri) + "&url=" + encodeURIComponent(url), {
        method: "POST",
      });
  
      if (!importResult.ok) {
        await deleteResource(packageIri);
        setLoading(false);
        return;
      }
  
      const {userMetadata: {label}} = await importResult.json();
      const plainName = lng(label);
  
      // Create semantic model
      await createModelInstructions[LOCAL_SEMANTIC_MODEL].createHook({
        parentIri: packageIri,
        label: {en: "Profile of " + plainName},
        description: {en: "Semantic model for the profile"},
        //baseIri: (event.target as any)["base-url"].value,
        modelAlias: "Profile of " + plainName,
      });
  
      // Create view model
      const viewIri = await createModelInstructions[LOCAL_VISUAL_MODEL].createHook({
        parentIri: packageIri,
        label: {en: "View for profile of " + plainName},
        description: {en: "View model for the profile"},
      }) as string;
  
      // Rename the original model
      await modifyUserMetadata(packageIri, {label: {en: "Profile of " + plainName}});
  
      // Redirect to url
      window.location.href = getCMELink(packageIri, viewIri);
  
      // Never resolve as we need to redirect!
      // resolve(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(value: boolean) => value ? null : resolve(false)}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>{t("project-wizard:projects.profile.create-title")}</ModalTitle>
        </ModalHeader>
        <ModalDescription>
          {t("project-wizard:projects.profile.help")}
        </ModalDescription>
        <ModalBody className="mt-auto flex flex-col gap-2 p-4">
          <form className="grid gap-4" onSubmit={formSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="url">{t("form.url.name")}<span className="text-red-500">*</span></Label>
              <Input id="url" placeholder={t("form.url.instruction")} required />
            </div>
            <LoadingButton type="submit" loading={loading}>{t("form.create-button.name")}</LoadingButton>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};