import './App.css'
import Dir from "./Dir";

function App() {
  return (
    <div className='relative flex min-h-screen flex-col bg-background'>
      <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-14 max-w-screen-2xl items-center'>
          <div>
            <strong>Dataspecer</strong> packages
          </div>
        </div>
      </header>
      <main className='flex-1 container items-start pt-5'>
        <Dir />
      </main>
    </div>
  )
}

export default App