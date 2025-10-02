
import './App.css';
import './Styles/BasicComponets.css'
import SkyboundItemHolder from './Components/SkyboundItemholder'
import SkyboundButton from './Components/SkyboundButton.js'
import SkyboundTextBox from './Components/SkyboundTextBox.js';
import SkyboundText from './Components/SkyboundText.js';




function App() {

 

  return (
    <div className='background'>
        <SkyboundItemHolder className ="itemHolder" width = "500px" height = "700px">
        <SkyboundText variant="primary" fontSize="100px">Login</SkyboundText>
        <SkyboundButton variant='primary' width = "100px" height = "50px" size = "500px">Click Me</SkyboundButton>
        <SkyboundTextBox width ="400px" height = "100px" placeholder="Type here..."></SkyboundTextBox>
      </SkyboundItemHolder>
      
    </div>
  );
}

export default App;
