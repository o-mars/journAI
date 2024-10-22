import './Footer.css';

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';

const Footer: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);

  useEffect(() => {
    console.log('auth changed!', auth);
    setIsLoggedIn(!!auth.currentUser);
  }, [auth]);

  return (
    <>
      {isLoggedIn && (
        <footer className="footer">
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </footer>
      )}
    </>
  );
};

export default Footer;