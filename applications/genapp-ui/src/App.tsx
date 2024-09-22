import { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { ApplicationGenerator, GenappInputArguments } from "@dataspecer/genapp"

function App() {

  const startAppGeneration = async () => {

      const input: GenappInputArguments = {
        appGraphPath: "",
        targetRootPath: ""
      };

      await (new ApplicationGenerator(input)).generate();
  }


  return (
    <div className='container mt-3'>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        <small>Dataspecer</small> genapp
      </h1>
      {/* <p className="leading-7 [&:not(:first-child)]:mt-6">
        This application written in React, Vite, Tailwind and shadcn/ui can be used to define custom applications.
      </p> */}
      <div>
        Choose application graph file:
      </div>
      <input id="graph-file-input" type="file" accept=".json" />
      <div>
        Choose output directory:
      </div>
      <input id="output-dir-input" type="file" />
      {/* <input directory="" webkitdirectory="" type="file" /> */}
      <Button onClick={startAppGeneration}>Generate application</Button>
    </div>
  )
}

export default App
