import { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div className='container mt-3'>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        <small>Dataspecer</small> genapp
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        This application written in React, Vite, Tailwind and shadcn/ui can be used to define custom applications.
      </p>

      <Button onClick={() => setCount(count + 1)}>You clicked {count} times!</Button>
    </div>
  )
}

export default App
