import { TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Table } from "@mui/material";
import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";

export interface SetKeyValueProps {
  currentKV: Record<string, string>;
  setCurrentKV: (kes: Record<string, string>) => void;
  //  parentKes: Record<string, string>;

  keyTitle: string,
  valueTitle: string;
  keyWidthPercent: number;
}

/**
 * This component allows to set and modify IRI kes.
 */
export const SetKeyValue = (props: SetKeyValueProps) => {
  const sortedKeyValue = useMemo(() => Object.entries(props.currentKV).sort(([A], [B]) => A.localeCompare(B)), [props.currentKV]);

  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: props.keyWidthPercent + "%" }} align="right">
              {props.keyTitle}
            </TableCell>
            <TableCell sx={{ width: (100 - props.keyWidthPercent) + "%" }}>{props.valueTitle}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedKeyValue.map(([k, v]) => (
            <Row
              key={k}
              k={k}
              v={v}
              onDelete={() => {
                const newKV = { ...props.currentKV };
                delete newKV[k];
                props.setCurrentKV(newKV);
              }}
              onChange={(newK, newV) => {
                const newKV = { ...props.currentKV };
                delete newKV[k];
                newKV[newK] = newV;
                props.setCurrentKV(newKV);
              }}
            />
          ))}
          <Row
            create
            onChange={(newK, newV) => {
              const newKV = { ...props.currentKV };
              newKV[newK] = newV;
              props.setCurrentKV(newKV);
            }}
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function Row({
  k: k,
  v: v,
  onDelete,
  onChange,
  create,
}: {
  k?: string;
  v?: string;
  onDelete?: () => void;
  onChange: (k: string, v: string) => void;
  create?: boolean;
}) {
  const [isBeingModified, setIsBeingModified] = useState(create || false);
  if (isBeingModified) {
    return (
      <Modify
        k={k}
        v={v}
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
      <TableRow key={k}>
        <TableCell align="right" style={{ overflow: "hidden", overflowWrap: "anywhere" }}>
          {k}
        </TableCell>
        <TableCell>
          <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
            <div style={{ flexGrow: 1, overflow: "hidden", overflowWrap: "anywhere" }}>{v}</div>
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
  k,
  v,
  onCancel,
  onChange,
  create,
}: {
  k?: string;
  v?: string;
  onCancel?: () => void;
  onChange: (k: string, v: string) => void;
  create?: boolean;
}) {
  const [newK, setNewK] = useState(k || "");
  const [newV, setNewV] = useState(v || "");
  const submit = () => {
    if (create) {
      setNewK("");
      setNewV("");
    }
    onChange(newK, newV);
  };
  return (
    <TableRow key={k}>
      <TableCell align="right">
        <TextField
          size="small"
          variant="outlined"
          hiddenLabel
          fullWidth
          value={newK}
          onChange={(e) => setNewK(e.target.value)}
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
          value={newV}
          onChange={(e) => setNewV(e.target.value)}
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
