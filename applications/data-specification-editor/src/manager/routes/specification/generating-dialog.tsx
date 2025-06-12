import React, {FC, useMemo} from "react";
import {Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {GenerateReport} from "@dataspecer/specification/v1";
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
import PendingTwoToneIcon from '@mui/icons-material/PendingTwoTone';
import BuildTwoToneIcon from '@mui/icons-material/BuildTwoTone';

const STATE_SORT_ORDER = {
  "error": 0,
  "progress": 1,
  "pending": 2,
  "success": 3,
}

/**
 * Dialog that shows progress of the generation process.
 */
export const GeneratingDialog: FC<{
  isOpen: boolean,
  close: () => void,
  inProgress: boolean,
  generateReport: GenerateReport
}> = ({isOpen, close, inProgress, generateReport}) => {
  const fileTree = useMemo(() => {
    const report = [...generateReport];
    report.sort((a, b) => (STATE_SORT_ORDER[a.state] - STATE_SORT_ORDER[b.state]) || (a.artifact.outputPath as string).localeCompare(b.artifact.outputPath as string));
    // @ts-ignore
    window.report = report;
    return report;
  }, [generateReport]);

  return <Dialog
    open={isOpen}
    onClose={close}
    maxWidth="lg"
    fullWidth
  >
    {inProgress && <LinearProgress/>}
    <DialogTitle>
      Generate artifacts report
    </DialogTitle>
    <DialogContent>
      <Alert sx={{mb: 2}} severity={fileTree.some(a => a.state === "error") ? "error" : (inProgress ? "info" : "success")}>
        <strong>{fileTree.filter(a => a.state === "success").length}</strong> artifacts successfully generated, <strong>{fileTree.filter(a => a.state === "error").length}</strong> failed to generate.
      </Alert>
      <DialogContentText>
        <TableContainer sx={{ height: 650 }}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Path</TableCell>
                <TableCell sx={{width: "50%"}}>State</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fileTree.map((report) => (
                <TableRow
                  key={report.artifact.iri as string}
                >
                  <TableCell>
                    {report.artifact.outputPath}
                  </TableCell>
                  <TableCell>
                    {report.state === "success" && <Chip sx={{border: "none"}} color="success" size="small" label="success" variant="outlined" icon={<CheckCircleTwoToneIcon />} />}
                    {report.state === "pending" && <Chip sx={{border: "none"}} size="small" label="pending" variant="outlined" icon={<PendingTwoToneIcon />} />}
                    {report.state === "progress" && <Chip sx={{border: "none"}} color="warning" size="small" label="in progress" variant="outlined" icon={<BuildTwoToneIcon />} />}
                    {report.state === "error" && <Chip sx={{border: "none"}} color="error" size="small" label={report.error?.message} variant="outlined" icon={<ErrorTwoToneIcon />} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={close} disabled={inProgress}>Close</Button>
    </DialogActions>
  </Dialog>;
}
