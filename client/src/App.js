import React, { Component, useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import View from './components/View';
import Edit from './components/Edit';
import Create from './components/Create';

function App() {
  const [token, setToken] = useState();
  const [username, setUsername] = useState();

  if(!token) {
    return <Login setToken={setToken} setUsername={setUsername} />
  }

  return (
    <div>
      <h1>Art Gallery</h1>
      <p>{token.username}</p>
      <button type="submit" onClick={e => setToken(null)}>Logout</button>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home username={username} />} />
          <Route path="/view" element={<View username={username} />} />
          <Route path="/edit" element={<Edit username={username} />} />
          <Route path="/create" element={<Create username={username} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;