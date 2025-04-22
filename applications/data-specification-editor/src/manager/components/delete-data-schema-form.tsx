import { Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { FC, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { BackendConnectorContext } from "../../application";
import { CloseDialogButton } from "../../editor/components/detail/components/close-dialog-button";
import { LanguageStringText } from "../../editor/components/helper/LanguageStringComponents";
import { dialog } from "../../editor/dialog";
import { SpecificationContext } from "../routes/specification/specification";

export const DeleteDataSchemaForm: FC<{
  isOpen: boolean;
  close: () => void;
  dataStructureIri: string;
}> = dialog({ fullWidth: true, maxWidth: "xs" }, ({ close, dataStructureIri }) => {
  const { t } = useTranslation("ui");

  const [specification, updateSpecification] = useContext(SpecificationContext);
  const structure = specification.dataStructures.find((structure) => structure.id === dataStructureIri);
  const backendPackageService = useContext(BackendConnectorContext);

  const del = useCallback(async () => {
    await backendPackageService.deleteResource(dataStructureIri);
    updateSpecification({
      ...specification,
      dataStructures: specification.dataStructures.filter((structure) => structure.id !== dataStructureIri),
    });
    close();
  }, [backendPackageService, dataStructureIri, updateSpecification, specification]);

  return (
    <>
      <DialogTitle>
        {t("deleteDataSchema.title")}
        <CloseDialogButton onClick={close} />
      </DialogTitle>
      <DialogContent>
        <Typography>{t("deleteDataSchema.text")}</Typography>
        <ul>
          <li>
            <strong>
              <LanguageStringText from={structure?.label} fallback={dataStructureIri} />
            </strong>
          </li>
        </ul>
        <Typography>{t("deleteDataSchema.additionalText")}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={del} color="error">
          {t("delete")}
        </Button>
        <Button onClick={close} variant="contained">
          {t("cancel")}
        </Button>
      </DialogActions>
    </>
  );
});
