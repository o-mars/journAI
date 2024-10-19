import React, { useState } from 'react';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import './Logout.css';
import ClientConfig from '../ClientConfig/ClientConfig';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { client } = useRealtimeClient();
  const [isShowingSettings, setIsShowingSettings] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      client && client.disconnect(); // TODO: Check if convo started, end it if so..
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleSettings = () => {
    setIsShowingSettings(prev => !prev);
  }

  return (
    <>
      <div className="logout-container">
        <p>{auth.currentUser?.email}</p>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={toggleSettings}>Settings</button>
      </div>
      {isShowingSettings && <div className="client-config-wrapper"><ClientConfig /></div>}
    </>
  );
};

export default Logout;
