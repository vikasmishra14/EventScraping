import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate=useNavigate();
    const handleClick=()=>{
  navigate('/events')
    }
  return (
    <div className="home-container">
      <h1>Welcome to EventFinder</h1>
      <p>Discover the best events happening around you!</p>
      <button onClick={handleClick}>Explore Events</button>
    </div>
  );
};

export default Home;
