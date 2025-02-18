import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { StoreContext } from "@dataspecer/federated-observable-store-react/store";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box, CircularProgress, IconButton, List, ListItemButton, ListItemText, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DialogParameters, useDialog } from "../../../dialog";
import { useNewFederatedObservableStoreFromSemanticEntities } from "../../../hooks/use-new-federated-observable-store-from-semantic-entities";
import { ExternalEntityWrapped } from "../../../semantic-aggregator/interfaces";
import { ConfigurationContext } from "../../App";
import { PimClassDetailDialog } from "../../detail/pim-class-detail-dialog";
import { ExternalEntityBadge } from "../../entity-badge";
import { translateFrom } from "../../helper/LanguageStringComponents";

const MAX_RESULTS = 30;

const useDebounceEffect = (effect: () => void, delay: number, debounceDeps: any[]) => {
  useEffect(() => {
    const handler = setTimeout(effect, delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, debounceDeps);
}

export const DefaultSearchDialogContent: React.FC<DialogParameters & { selected: (cls: string) => void }> = ({ close, selected }) => {
  const { semanticModelAggregator } = React.useContext(ConfigurationContext);
  const [findResults, updateFindResults] = useState<ExternalEntityWrapped[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const { t, i18n } = useTranslation("search-dialog");

  const [searchText, setSearchText] = useState("");

  const DetailDialog = useDialog(PimClassDetailDialog);

  const newStore = useNewFederatedObservableStoreFromSemanticEntities(findResults ? findResults.map(e => e.aggregatedEntity) : []);

  useDebounceEffect(() => {
      setError(false);
      if (searchText) {
          setLoading(true);
          semanticModelAggregator.search(searchText).then(result => {
              updateFindResults(result.filter((res, i) => i < MAX_RESULTS && res));
          }).catch(error => {
              console.info("Error during search.", error);
              setError(true);
          }).finally(() => setLoading(false));
      } else {
          updateFindResults(null);
      }
  }, false ? 0 : 100, [searchText, semanticModelAggregator]);

  return (
    <>
      <Box display={"flex"}>
        <TextField
          placeholder={t("placeholder")}
          fullWidth
          autoFocus
          onChange={e => setSearchText(e.target.value)}
          error={isError}
          variant={"standard"}
          autoComplete="off"
          value={searchText}
        />
        <CircularProgress style={{ marginLeft: "1rem" }} size={30} value={0} variant={loading ? "indeterminate" : "determinate"} />
      </Box>
      <List dense component="nav"
        sx={{
          overflow: 'auto',
          margin: theme => theme.spacing(2, 0, 0, 0),
        }}
      >
        {findResults && findResults.map((result: ExternalEntityWrapped<SemanticModelClass>, index) =>
          <ListItemButton key={index} onClick={async () => {
            const entity = await semanticModelAggregator.externalEntityToLocalForSearch(result);
            console.log("User selected", result.aggregatedEntity.id, entity.aggregatedEntity.id);
            selected(entity.aggregatedEntity.id);
            close();
          }}>
            <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap
              title={translateFrom(result.aggregatedEntity.name, i18n.languages)}>{translateFrom(result.aggregatedEntity.description, i18n.languages)}</Typography>}>
              <strong>{translateFrom(result.aggregatedEntity.name, i18n.languages)} [{result.note}]</strong>
              <ExternalEntityBadge entity={result} />
            </ListItemText>
            <IconButton onClick={e => {
              e.stopPropagation();
              DetailDialog.open({ iri: result.aggregatedEntity.id as string })
            }}>
              <InfoTwoToneIcon />
            </IconButton>
          </ListItemButton>
        )}

        {(!findResults || findResults.length === 0) &&
          <Box sx={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: (theme) => theme.palette.grey[500],
            flexDirection: "column",
          }}>
            {!findResults && <><SearchIcon sx={{ display: "block", height: "4rem", width: "4rem" }} />{t('info panel start typing')}</>}
            {findResults && <><SearchOffIcon sx={{ display: "block", height: "4rem", width: "4rem" }} />{t('info panel nothing found')}</>}
          </Box>}
      </List>
      <StoreContext.Provider value={newStore}>
        <DetailDialog.Component />
      </StoreContext.Provider>
    </>
  );
}