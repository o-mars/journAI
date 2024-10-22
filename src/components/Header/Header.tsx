import './Header.css';

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import { useNavigate } from 'react-router-dom';


interface HeaderProps {
  title: string;
  navigation?: JSX.Element;
  actionButton?: JSX.Element;
}

const Header: React.FC<HeaderProps> = ({ title, navigation, actionButton }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const { client, finishConversation } = useRealtimeClient();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    });

    return () => unsubscribe();
  }, [auth]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      // finishConversation();
      // client && client.disconnect();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  return (
    <header className="header">
      {/* {isLoggedIn && <div className="navigation">{}</div>} */}
      <div className="left"></div>
      <h1>{title}</h1>
      <div className="right">
        {isLoggedIn && <div onClick={handleLogout} className="action-button">DC</div>}
      </div>
    </header>
  );
};

export default Header;
