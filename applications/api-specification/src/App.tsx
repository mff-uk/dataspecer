import './App.css';
import {ApiSpecificationForm} from './MainForm.tsx'
import {SplitScreen} from './SplitScreen.tsx'

const ComponentLeft = () => 
{
  return <ApiSpecificationForm/>;
}

const ComponentRight = () => 
{
  return <p>Anastasia</p>;
}

function App() {
  return (
    //<ApiSpecificationForm/>
    <SplitScreen
      leftSide = {ComponentLeft}
      rightSide ={ComponentRight}
    />
  )
}

export default App
