import './App.css';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button } from './components/ui/button';
import { OutputFilenameInput } from './UserInput';
import { downloadGeneratedZip } from './download-generated-zip';
import { Alert, Backdrop, CircularProgress } from '@mui/material';

function App() {

  const reader = new FileReader();
  const [file, setFile] = useState<File>();
  const [fileContent, setFileContent] = useState<string>();
  const [resultZipName, setResultZipName] = useState<string | null>(null);
  const [appBeingGenerated, setAppBeingGenerated] = useState<boolean>(false);
  const [failureMsg, setFailureMsg] = useState<string>("");
  reader.onload = (event: ProgressEvent<FileReader>) => {

    const content: string = event.target?.result as string;

    if (!content) {
      console.error("No valid file content found");
      return;
    }

    setFileContent(content);
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];

    if (!file) {
      console.error("Invalid file");
      return;
    }

    setFile(file);
    reader.readAsText(file);
  }

  const startAppGeneration = async () => {
    setFailureMsg("");

    if (!fileContent || fileContent === "") {
      setFailureMsg("File to be read is missing");
      return;
    }

    setAppBeingGenerated(true);

    try {
      const zipBlob: Blob | null = await downloadGeneratedZip(
        resultZipName ?? "genapp",
        fileContent
      );

      if (!zipBlob) {
        setFailureMsg("Missing generated application artifact");
        return;
      }

      saveAs(zipBlob, `${resultZipName ?? "genapp"}.zip`);
    } catch {
      setFailureMsg("Application generation failed");
    }
    finally {
      setAppBeingGenerated(false);
    }
  }

  return (
    <div className="container mt-3">
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={appBeingGenerated}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        <small>Dataspecer</small> genapp
      </h1>
      {
        (failureMsg !== "") && <Alert severity="error">{failureMsg}</Alert>
      }
      <OutputFilenameInput
        id="outputfile_input"
        placeholder="Result ZIP file without '.zip' extension"
        label="Choose output file name"
        zipNameState={[resultZipName, setResultZipName]}
      />
      <div className="p-1 flex items-center">
        <label htmlFor={"graph-file-input"} className="mr-2">Select application graph file: </label>
        <input id="graph-file-input" type="file" accept=".json" onChange={handleFileChange} />
      </div>
      <div className="pt-5 flex items-center">
        <Button onClick={startAppGeneration} disabled={!file || !resultZipName}>Generate application</Button>
      </div>
    </div>
  )
}

export default App
