import { Modal, ModalBody, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@/components/modal";
import { LoadingButton } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BetterModalProps } from "@/lib/better-modal";
import { requestLoadPackage } from "@/package";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface AddImportedProps {
  id: string;
}

export const AddImported = ({ id, isOpen, resolve }: AddImportedProps & BetterModalProps<boolean>) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);

  const formSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setLoading(true);

    try {
      const urls = (event.target as any)["url"].value.split("\n").map((url: string) => url.trim()).filter((url: string) => url.length > 0);

      if (urls.length === 0) {
        setLoading(false);
        return;
      }

      // Import

      const importResults = [];
      for (const url of urls) {
        importResults.push(await fetch(import.meta.env.VITE_BACKEND + "/resources/import?parentIri=" + encodeURIComponent(id) + "&url=" + encodeURIComponent(url), {
          method: "POST",
        }));
      }

      await requestLoadPackage(id, true);

      if (importResults.every(r => r.ok)) {
        toast.success(t("add-imported.success"));
      } else {
        toast.error(t("add-imported.error"));
      }

      resolve(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <Modal open={isOpen} onClose={() => loading ? null : resolve(false)} >
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{t("add-imported.title")}</ModalTitle>
          <ModalDescription>
            {t("add-imported.warning")}
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="mt-auto flex flex-col gap-2 p-4">
          <form className="grid gap-4" onSubmit={formSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="url">{t("form.url.name")}<span className="text-red-500">*</span></Label>
              <Textarea id="url" placeholder={t("form.url.instruction")} required />
            </div>

            <LoadingButton type="submit" loading={loading}>{t("add-imported.import")}</LoadingButton>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}