import { TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Table } from "@mui/material";
import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";

export interface SetPrefixesProps {
  currentPrefixes: Record<string, string>;
  setCurrentPrefixes: (prefixes: Record<string, string>) => void;
  //  parentPrefixes: Record<string, string>;
}

/**
 * This component allows to set and modify IRI prefixes.
 */
export const SetPrefixes = (props: SetPrefixesProps) => {
  const sortedPrefixes = useMemo(() => Object.entries(props.currentPrefixes).sort(([prefixA], [prefixB]) => prefixA.localeCompare(prefixB)), [props.currentPrefixes]);

  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "20%" }} align="right">
              Prefix
            </TableCell>
            <TableCell sx={{ width: "80%" }}>IRI</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedPrefixes.map(([prefix, iri]) => (
            <Row
              key={prefix}
              prefix={prefix}
              iri={iri}
              onDelete={() => {
                const newPrefixes = { ...props.currentPrefixes };
                delete newPrefixes[prefix];
                props.setCurrentPrefixes(newPrefixes);
              }}
              onChange={(newPrefix, newIri) => {
                const newPrefixes = { ...props.currentPrefixes };
                delete newPrefixes[prefix];
                newPrefixes[newPrefix] = newIri;
                props.setCurrentPrefixes(newPrefixes);
              }}
            />
          ))}
          <Row
            create
            onChange={(newPrefix, newIri) => {
              const newPrefixes = { ...props.currentPrefixes };
              newPrefixes[newPrefix] = newIri;
              props.setCurrentPrefixes(newPrefixes);
            }}
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function Row({
  prefix,
  iri,
  onDelete,
  onChange,
  create,
}: {
  prefix?: string;
  iri?: string;
  onDelete?: () => void;
  onChange: (prefix: string, iri: string) => void;
  create?: boolean;
}) {
  const [isBeingModified, setIsBeingModified] = useState(create || false);
  if (isBeingModified) {
    return (
      <Modify
        prefix={prefix}
        iri={iri}
        create={create}
        onCancel={() => setIsBeingModified(false)}
        onChange={(...p) => {
          onChange(...p);
          setIsBeingModified(!!create);
        }}
      />
    );
  } else {
    return (
      <TableRow key={prefix}>
        <TableCell align="right" style={{ overflow: "hidden", overflowWrap: "anywhere" }}>
          {prefix}
        </TableCell>
        <TableCell>
          <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
            <div style={{ flexGrow: 1, overflow: "hidden", overflowWrap: "anywhere" }}>{iri}</div>
            <IconButton size="small" onClick={() => setIsBeingModified(true)}>
              <EditTwoToneIcon fontSize="small" />
            </IconButton>
            <IconButton color="error" size="small" onClick={onDelete}>
              <DeleteTwoToneIcon fontSize="small" />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
    );
  }
}

function Modify({
  prefix,
  iri,
  onCancel,
  onChange,
  create,
}: {
  prefix?: string;
  iri?: string;
  onCancel?: () => void;
  onChange: (prefix: string, iri: string) => void;
  create?: boolean;
}) {
  const [newPrefix, setNewPrefix] = useState(prefix || "");
  const [newIri, setNewIri] = useState(iri || "");
  const submit = () => {
    if (create) {
      setNewPrefix("");
      setNewIri("");
    }
    onChange(newPrefix, newIri);
  };
  return (
    <TableRow key={prefix}>
      <TableCell align="right">
        <TextField
          size="small"
          variant="outlined"
          hiddenLabel
          fullWidth
          value={newPrefix}
          onChange={(e) => setNewPrefix(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit();
            }
          }}
        />
      </TableCell>
      <TableCell sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          variant="outlined"
          hiddenLabel
          fullWidth
          value={newIri}
          onChange={(e) => setNewIri(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit();
            }
          }}
        />
        {!create && (
          <IconButton size="small" onClick={onCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton color="primary" size="small" onClick={submit}>
          {create ? <AddIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
