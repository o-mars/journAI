import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Notes from './components/Notes/Notes';
import Signup from './components/Signup/Signup';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Main } from './components/Main/Main';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { RealtimeClientProvider } from './contexts/RealtimeClientContext';

const App: React.FC = () => {

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // console.log("Persistence set to local");
      })
      .catch((error) => {
        console.error("Error setting persistence: ", error);
      });
  }, []); // Runs once when the app loads

  return (
    <Router>
      <div className="app-container">
        <div className="phone-ui">
          
            <Header title="JournAI" />
            <div className="main-body">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/main" element={<RealtimeClientProvider><Main /></RealtimeClientProvider>} />
                <Route path="/" element={<Login />} />
              </Routes>
            </div>
          {/* <Footer /> */}
        </div>
      </div>
      {/* <div className="title">JournAI</div> */}
    </Router>
  );
};

export default App;
