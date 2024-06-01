import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

const OpenAPIDisplay = ({ generatedOpenAPISpecification }: { generatedOpenAPISpecification: any }) => {

  /* opens swagger editor */
  const openSwaggerEditor = () => {
    const swaggerUrl = 'https://editor.swagger.io/';
    window.open(swaggerUrl, '_blank');
  };

  /* downloads generated OpenAPI specification in JSON format
   * generated OAS is converted into json string
   * next a blob object is created corresponding to the json string 
   * next a url is created from the blob object 
   * an anchor element is created and its attributes are set
   * lastly a click is simulated
   */
  const downloadOpenAPISpecJSON = () => {
    const jsonStr = JSON.stringify(generatedOpenAPISpecification, null, 2);
    const blobObj = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blobObj);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'openapi-specification.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  /* copies generated OAS to clipboard 
   * generated OAS is converted into json string
   * In case of successful copy the user is alerted that the OAS was copied to clipboard
   */
  const copyOASToClipboard = () => {
    const jsonString = JSON.stringify(generatedOpenAPISpecification, null, 2);
    navigator.clipboard.writeText(jsonString).then(
      () => {
        alert('OpenAPI Specification copied to clipboard!');
      },
      (myError) => {
        console.error('Could not copy OpenAPI Specification - Error: ', myError);
      }
    );
  };

  return (
    <div className="flex flex-col h-full w-full p-9">
      <Card className="flex-1 h-full">
        <CardHeader>
          <CardTitle>Generated OpenAPI Specification</CardTitle>
          <Button onClick={openSwaggerEditor} className="bg-blue-500">Open Swagger Editor</Button>
          <Button onClick={downloadOpenAPISpecJSON} className="bg-green-500">Download JSON</Button>
          <Button onClick={copyOASToClipboard} className="bg-yellow-500">Copy to Clipboard</Button>
        </CardHeader>

        <CardContent className="overflow-auto">
          <CardDescription>
            <pre>{JSON.stringify(generatedOpenAPISpecification, null, 2)}</pre>
          </CardDescription>
        </CardContent>
        <div className="p-4">

        </div>
      </Card>
    </div>
  );
};

export default OpenAPIDisplay;
