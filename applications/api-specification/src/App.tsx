// import React from 'react';
// import './App.css';
// import {ApiSpecificationForm} from './UpdatedMainForm.tsx'
// import {SplitScreen} from './SplitScreen.tsx'

// const ComponentLeft = () => 
// {
//   return <ApiSpecificationForm/>;
// }

// const ComponentRight = () => 
// {
//   return <p>Anastasia</p>;
// }

// function App() {
//   return (
//     //<ApiSpecificationForm/>
//     <SplitScreen
//       leftSide = {ComponentLeft}
//       rightSide ={ComponentRight}
//     />
//   )
// }

// export default App

import React, { useState } from 'react';
import './App.css';
import { ApiSpecificationForm } from './UpdatedMainForm.tsx';
import { SplitScreen } from './SplitScreen.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';


interface ComponentLeftProps {
  setGeneratedOpenAPISpecification: (openAPISpec: any) => void;
}

const ComponentLeft: React.FC<ComponentLeftProps> = ({ setGeneratedOpenAPISpecification }) => {
  return <ApiSpecificationForm setGeneratedOpenAPISpecification={setGeneratedOpenAPISpecification} />;
};



const ComponentRight = ({ generatedOpenAPISpecification }: { generatedOpenAPISpecification: any }) => {
  const openSwaggerEditor = () => {
    const swaggerUrl = 'https://editor.swagger.io/';
    window.open(swaggerUrl, '_blank');
  };
  return (
    <div className="flex flex-col h-full"> 
      <Card className="flex-1"> 
        <CardHeader>
          <CardTitle>Generated OpenAPI Specification</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto"> 
          <CardDescription>
            <pre>{JSON.stringify(generatedOpenAPISpecification, null, 2)}</pre>
          </CardDescription>
        </CardContent>
        <div className="p-4">
          <button onClick={openSwaggerEditor} className="bg-blue-500 text-white py-2 px-4 rounded">Open in Swagger Editor</button>
        </div>
      </Card>
    </div>
  );
};


function App() {
  const [generatedOpenAPISpecification, setGeneratedOpenAPISpecification] = useState(null);

  
  return (
    <SplitScreen
    leftSide={() => <ComponentLeft setGeneratedOpenAPISpecification={setGeneratedOpenAPISpecification} />}
    rightSide={() => <ComponentRight generatedOpenAPISpecification={generatedOpenAPISpecification} />}
    />
  );
}

export default App;
