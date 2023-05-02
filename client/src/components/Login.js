import React, { useState }  from 'react';
import PropTypes from 'prop-types';

async function loginUser(credentials) {
    return fetch('/gallery/enter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
}

// Username is from App.js for holding the username in memory for the app
// UserName is from Login.js for holding form input
export default function Login({ setToken, setUsername }) {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();

    const handleSubmit = async e => {
        e.preventDefault();
        const result = await loginUser({
          username,
          password
        });
        if (result.match) {
            setToken(result.token);
            setUsername(result.username);
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <h1>Art Gallery</h1>
            <h2>Login</h2>
            <label>
                <p>Username</p>
                <input type="text" onChange={e => setUserName(e.target.value)} />
            </label>
            <label>
                <p>Password</p>
                <input type="password" onChange={e => setPassword(e.target.value)} />
            </label>
            <div>
                <button type="submit">Submit</button>
            </div>
        </form>
    )
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
}