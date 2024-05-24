import React from 'react';
import './App.css';
import {ApiSpecificationForm} from './UpdatedMainForm.tsx'
import {SplitScreen} from './SplitScreen.tsx'

function App() {
  return (
    <ApiSpecificationForm setGeneratedOpenAPISpecification={function (openAPISpec: any): void {
      throw new Error('Function not implemented.');
    } }/>
  )
}

export default App

// import React, { useState } from 'react';
// import './App.css';
// import { ApiSpecificationForm } from './UpdatedMainForm.tsx';
// import { SplitScreen } from './SplitScreen.tsx';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
// import { Button } from './components/ui/button';

// interface ComponentLeftProps {
//   setGeneratedOpenAPISpecification: (openAPISpec: any) => void;
// }

// const ComponentLeft: React.FC<ComponentLeftProps> = ({ setGeneratedOpenAPISpecification }) => {
//   return <ApiSpecificationForm setGeneratedOpenAPISpecification={setGeneratedOpenAPISpecification} />;
// };



// const ComponentRight = ({ generatedOpenAPISpecification }: { generatedOpenAPISpecification: any }) => {
//   const openSwaggerEditor = () => {
//     const swaggerUrl = 'https://editor.swagger.io/';
//     window.open(swaggerUrl, '_blank');
//   };

//   const downloadOpenAPISpec = () => {
//     const jsonString = JSON.stringify(generatedOpenAPISpecification, null, 2);
//     const blob = new Blob([jsonString], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'openapi-specification.json';
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   const copyToClipboard = () => {
//     const jsonString = JSON.stringify(generatedOpenAPISpecification, null, 2);
//     navigator.clipboard.writeText(jsonString).then(
//       () => {
//         alert('OpenAPI Specification copied to clipboard!');
//       },
//       (err) => {
//         console.error('Could not copy - Error: ', err);
//       }
//     );
//   };


//   return (
//     <div className="flex flex-col h-full p-9">
//       <Card className="flex-1">
//         <CardHeader>
//           <CardTitle>Generated OpenAPI Specification</CardTitle>
//           <Button onClick={openSwaggerEditor} className="bg-blue-500">Open Swagger Editor</Button>
//           <Button onClick={downloadOpenAPISpec} className="bg-green-500">Download JSON</Button>
//           <Button onClick={copyToClipboard} className="bg-yellow-500">Copy to Clipboard</Button>
//         </CardHeader>
        
//         <CardContent className="overflow-auto">
//           <CardDescription>
//             <pre>{JSON.stringify(generatedOpenAPISpecification, null, 2)}</pre>
//           </CardDescription>
//         </CardContent>
//         <div className="p-4">

//         </div>
//       </Card>
//     </div>
//   );
// };


// function App() {
//   const [generatedOpenAPISpecification, setGeneratedOpenAPISpecification] = useState(null);


//   return (
//     <SplitScreen
//       leftSide={() => <ComponentLeft setGeneratedOpenAPISpecification={setGeneratedOpenAPISpecification} />}
//       rightSide={() => <ComponentRight generatedOpenAPISpecification={generatedOpenAPISpecification} />}
//     />
//   );
// }

// export default App;
