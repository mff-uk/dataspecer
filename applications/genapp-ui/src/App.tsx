import './App.css';
import { useState } from 'react';
import axios, { AxiosResponse } from "axios";
import { Button } from './components/ui/button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {

  const [file, setFile] = useState();
  const [resultZipName, setResultZipName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const reader = new FileReader();

  const handleFileChange = (event: any) => {
    console.log(event.target.files[0]);
    setFile(event.target.files[0]);
  }

  const handleOutputZipName = (event: any) => {
    setResultZipName(event.target.value);
  }

  const startAppGeneration = async () => {
    reader.onload = (event: ProgressEvent<FileReader>) => {

      const content: string = event.target?.result as string;

      if (!content) {
        console.error("No valid file content found");
      }

      setFileContent(content);
    };

    if (file) {
      reader.readAsText(file);  // Read the file content as text
    }

    const response = await axios.post<any, AxiosResponse<Blob, any>>(
      `http://localhost:3100/generate-app?zipname=${resultZipName ?? "genapp"}`,
      { serializedGraph: fileContent }
    );

    console.log("RECEIVED LENGTH: ", response.data);
    saveAs(response.data, `${resultZipName ?? "genapp"}.zip`);


    //console.log(response);
  }

  return (
    <div className='container mt-3'>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        <small>Dataspecer</small> genapp
      </h1>
      <div>
        Choose output name:
      </div>
      <input id="output-zip-name" type="text" onChange={handleOutputZipName} />
      <div>
        Choose application graph file:
      </div>
      <input id="graph-file-input" type="file" accept=".json" onChange={handleFileChange} />
      <Button onClick={startAppGeneration} disabled={file === undefined}>Generate application</Button>
    </div>
  )
}

export default App
