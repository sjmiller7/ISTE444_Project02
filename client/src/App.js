import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import View from './components/View';
import Edit from './components/Edit';
import Create from './components/Create';

function App() {
  const [token, setToken] = useState();

  if(!token) {
    return <Login setToken={setToken} />
  }

  return (
    <div>
      <h1>Art Gallery</h1>
      <p>{token.username}</p>
      <button type="submit" onClick={e => setToken(null)}>Logout</button>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/view" element={<View />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;