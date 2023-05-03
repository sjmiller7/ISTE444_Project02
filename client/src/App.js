import React, { Component, useState } from 'react';
import './custom.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import View from './components/View';
import Curate from './components/Curate';
import Donate from './components/Donate';

function App() {
  const [token, setToken] = useState();
  const [username, setUsername] = useState();

  if(!token) {
    return <Login setToken={setToken} setUsername={setUsername} />
  }

  return (
    <div>
      <div className='pageWrapper'>
        <BrowserRouter>
          <div className='nav cardBg'>
            <h1>Art Gallery</h1>
            <div className='navlink'>
              <Link to="/">
                <button>Home</button>
              </Link>
            </div>
            <div className='navlink'>
              <Link to="/donate">
                <button>Donate Art</button>
              </Link>
            </div>
            <div className='navlink'>
              <button type="submit" onClick={e => setToken(null)}>Logout</button>
            </div>
          </div>
          <Routes>
            <Route index element={<Home username={username} />} />
            <Route path="/view" element={<View username={username} />} />
            <Route path="/curate" element={<Curate username={username} />} />
            <Route path="/donate" element={<Donate username={username} />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;