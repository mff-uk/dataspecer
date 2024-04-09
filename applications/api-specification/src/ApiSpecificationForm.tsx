// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { SubmitHandler } from 'react-hook-form';
// import { Button } from './components/ui/button';
// import { Card } from './components/ui/card';
// import { Input } from './components/ui/input';
// //import {Form} from './components/ui/form'

// // Define the type for your form data
// type FormValues = {
//   apiTitle: string;
//   apiDescription: string;
//   apiVersion: string;
//   baseUrl: string;
//   dataSpecification: string;
//   endpoints: {
//     url: string;
//     operations: {
//       method: string;
//       description: string;
//     }[];
//   }[];
// };

// // Define form schema using zod
// const formSchema = z.object({
//   apiTitle: z.string().min(1),
//   apiDescription: z.string().min(1),
//   apiVersion: z.string().min(1),
//   baseUrl: z.string().min(1),
//   dataSpecification: z.string().min(1),
//   endpoints: z.array(
//     z.object({
//       url: z.string().min(1),
//       operations: z.array(
//         z.object({
//           method: z.string().min(1),
//           description: z.string().min(1),
//         })
//       ),
//     })
//   ),
// });

// export const ApiSpecificationForm = () => {
//   // Create form instance using useForm
//   const { register, handleSubmit } = useForm<FormValues>();

//   // State to store endpoints
//   const [endpoints, setEndpoints] = useState<FormValues['endpoints']>([{ url: '', operations: [{ method: '', description: '' }] }]);

//   // Function to handle form submission
//   const onSubmit: SubmitHandler<FormValues> = (data) => {
//     // Validate form data against the schema
//     try {
//       formSchema.parse(data);
//       // Logic to handle form submission
//       console.log('Form submitted with data:', data);
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error('Form validation failed:', error.message);
//       } else {
//         console.error('Form validation failed:', 'Unknown error occurred');
//       }
//     }
//   };

//   // Function to add a new endpoint
//   const addEndpoint = () => {
//     setEndpoints([...endpoints, { url: '', operations: [{ method: '', description: '' }] }]);
//   };

//   // Function to delete an endpoint
//   const deleteEndpoint = (index: number) => {
//     const updatedEndpoints = [...endpoints];
//     updatedEndpoints.splice(index, 1);
//     setEndpoints(updatedEndpoints);
//   };

//   return (
//     <form className = "flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
//       {/* Input fields for API Title, Description, Version, Base URL, and Data Specification */}
//       <Card className = "p-4">
//       <div>
//         <label htmlFor="apiTitle">API Title</label>
//         <Input 
//           id="apiTitle" 
//           required 
//           {...register('apiTitle')} 
//         />
//       </div>

//       <div>
//         <label htmlFor="apiDescription">API Description</label>
//         <Input 
//           id="apiDescription" 
//           required 
//           {...register('apiDescription')} 
//         />
//       </div>

//       <div>
//         <label htmlFor="apiVersion">API Version</label>
//         <Input 
//           id="apiVersion" 
//           required 
//           {...register('apiVersion')} 
//         />
//       </div>

//       <div>
//         <label htmlFor="baseUrl">Base URL</label>
//         <Input 
//           id="baseUrl" 
//           required 
//           {...register('baseUrl')} 
//         />
//       </div>

//       <div>
//         <label htmlFor="dataSpecification">Data Specification</label>
//         <Input 
//           id="dataSpecification" 
//           required 
//           {...register('dataSpecification')} 
//         />
//       </div>
//       </Card>

//       {/* Endpoints */}
//       <Card className="flex p-4 flex-col gap-4">
//         <h3>Endpoints:</h3>
//         {endpoints.map((_endpoint, index) => (
//           <Card className = "p-4" key={index}>
//             <div className = "flex w-full justify-end" ><Button className = "bg-red-500 hover:bg-red-400" type="button" onClick={() => deleteEndpoint(index)}>Delete</Button></div>
//             <div>
//               <label htmlFor={`endpoints[${index}].url`}>URL</label>
//               <Input 
//                 id={`endpoints[${index}].url`} 
//                 required 
//                 {...register(`endpoints.${index}.url` as const)} 
//               />
//             </div>
//             <div>
//               <label htmlFor={`endpoints[${index}].operations[0].method`}>Method</label>
//               <Input 
//                 id={`endpoints[${index}].operations[0].method`} 
//                 required 
//                 {...register(`endpoints.${index}.operations.0.method` as const)} 
//               />
//             </div>
//             <div>
//               <label htmlFor={`endpoints[${index}].operations[0].description`}>Description</label>
//               <Input 
//                 id={`endpoints[${index}].operations[0].description`} 
//                 required 
//                 {...register(`endpoints.${index}.operations.0.description` as const)} 
//               />
//             </div>
            
//           </Card>
//         ))}
//         <div className='flex w-full justify-center'><Button className='bg-blue-500 hover:bg-blue-400' type="button" onClick={addEndpoint}>Add Endpoint</Button></div>
//       </Card>

//       <Button>Generate OpenAPI Specification</Button>
//     </form>
//   );
// };

// export default ApiSpecificationForm;

