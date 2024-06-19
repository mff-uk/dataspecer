import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createModelInstructions, getCMELink } from "@/known-models";
import { BetterModalProps } from "@/lib/better-modal";
import { LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { useTranslation } from "react-i18next";


export const Vocabulary = ({ isOpen, resolve, iri }: { iri: string } & BetterModalProps<boolean>) => {
  const {t, i18n} = useTranslation();

  const formSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const name = (event.target as any)["name"].value;

    // Create package
    const packageIri = await createModelInstructions[LOCAL_PACKAGE].createHook({
      parentIri: iri,
      label: {[i18n.language]: name},
      description: {[i18n.language]: (event.target as any)["description"].value},
    }) as string;

    // Create semantic model
    await createModelInstructions[LOCAL_SEMANTIC_MODEL].createHook({
      parentIri: packageIri,
      label: {en: "Semantic model"},
      description: {en: "Semantic model for the vocabulary"},
      baseIri: (event.target as any)["base-url"].value,
      modelAlias: name,
    });

    // Create view model
    const viewIri = await createModelInstructions[LOCAL_VISUAL_MODEL].createHook({
      parentIri: packageIri,
      label: {en: "Main view"},
      description: {en: "View model for the vocabulary"},
    }) as string;

    // Redirect to url
    window.location.href = getCMELink(packageIri, viewIri);

    // Never resolve as we need to redirect!
    // resolve(true);
  }

  return (
    <Modal open={isOpen} onOpenChange={(value: boolean) => value ? null : resolve(false)}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>{t("project-wizard:projects.vocabulary.create-title")}</ModalTitle>
        </ModalHeader>
        <ModalBody className="mt-auto flex flex-col gap-2 p-4">
          <form className="grid gap-4" onSubmit={formSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">{t("form.name.name")}<span className="text-red-500">*</span></Label>
              <Input id="name" placeholder={t("form.name.instruction")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t("form.description.name")}</Label>
              <Textarea id="description" placeholder={t("form.description.instruction")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="base-url">{t("form.base-iri.name")}</Label>
              <Input id="base-url" placeholder={t("form.base-iri.instruction")} />
            </div>
            {/* <div className="grid gap-2">
              <Label htmlFor="documentation-url">{t("form.documentation-base-url.name")}</Label>
              <Input id="documentation-url" placeholder={t("form.documentation-base-url.instruction")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authors">{t("form.authors.name")}</Label>
              <Textarea id="authors" placeholder={t("form.authors.instruction")} />
            </div> */}
            <Button type="submit">{t("form.create-button.name")}</Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};