import './App.css';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button } from './components/ui/button';
import { OutputFilenameInput } from './UserInput';
import { downloadGeneratedZip } from './download-generated-zip';

function App() {

  const reader = new FileReader();
  const [file, setFile] = useState();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [resultZipName, setResultZipName] = useState<string | null>(null);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setFile(file);
  }

  const startAppGeneration = async () => {
    reader.onload = (event: ProgressEvent<FileReader>) => {

      const content: string = event.target?.result as string;

      if (!content) {
        console.error("No valid file content found");
        return;
      }

      setFileContent(content);
    };

    if (file) {
      reader.readAsText(file);
    }

    const zipBlob: Blob = await downloadGeneratedZip(
      resultZipName ?? "genapp",
      fileContent ?? ""
    );
    saveAs(zipBlob, `${resultZipName ?? "genapp"}.zip`);
  }

  return (
    <div className="container mt-3">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        <small>Dataspecer</small> genapp
      </h1>
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
