
import './App.css';
import './Styles/loginScreen.css'
import SkyboundItemHolder from './Components/SkyboundItemholder'
import SkyboundButton from './Components/SkyboundButton.js'

function Hello() {
  return <h1>Hello World!QQ!!!!!!</h1>
}


function App() {
  return (
    <div className='login-background'>
      <SkyboundItemHolder className ='login-itemHolder'>
        <Hello></Hello>
        <SkyboundButton className = 'login-skyboundButton'>Click Me</SkyboundButton>
      </SkyboundItemHolder>
    </div>
  );
}

export default App;
