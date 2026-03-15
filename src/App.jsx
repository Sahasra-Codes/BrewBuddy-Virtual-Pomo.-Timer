import { useNavigate } from 'react-router-dom';
import "./App.css";

function App() {
  const navigate = useNavigate(); // hook to navigate

  const handleStartClick = () => {
    navigate("/home"); // route to your new page
  };
  
 
  return (

    <div className="app-container">
      <div class="bean"></div>
      <div class="bean"></div>
      <div class="bean"></div>
      <div class="bean"></div>
      <div class="bean"></div>
      <div class="bean"></div>
      <div class="bean"></div>
      <div class="bean"></div>
      <div class="bean"></div>


      {/*THIS IS START PAGE*/}
      <div className="startpage">
        <div className="logotxt">
          <img src="textlogo.png" alt="" /> 
        </div>
        <div className="strtbutton" onClick={() => navigate('/home')}>
          <img src="start.png" alt="Start Button" />
        </div>

      </div>
      
    </div>

      


  );
}

export default App;
