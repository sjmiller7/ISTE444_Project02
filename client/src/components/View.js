import React, { useEffect, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';

export default function View(props) {
  let [data, setData] = useState();
  let [deleted, setDeleted] = useState(false);
  let { state } = useLocation();
    
  useEffect(() => {
      if (!data) {
          callBackendAPI()
          .then(res => setData(res) )
          .catch(err => console.log(err));
      }
        return () => {}
  });

  async function callBackendAPI() {
      const response = await fetch('/gallery/view/' + state.id + '?username=' + props.username);
      const body = await response.json();
      if (response.status !== 200) {
        throw Error(body.message) 
      }
      return body;
  };

  async function deleteArt() {
      const response = await fetch('/gallery/steal', {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: props.username,
          artID: state.id
        })
      });
      const body = await response.json();
      if (response.status !== 200) {
        console.log(body.message) 
      }
      setDeleted(true)
      return '';
  }

  if (deleted) {
    return (
      <Navigate to="/" replace={true} />
    );
  }
  else if (data) {
    return(
      <div>
        <Link to="/">
            <button>Back to Home</button>
        </Link>
        <img src={data.img}></img>
        <h2>{data.name} ({data.created})</h2>
        {data.style ? <p><b>Style:</b> {data.style}</p> : null}
        <p><b>Media:</b> {data.media}</p>
        <p><b>Artist:</b> {data.artist.name} ({data.artist.born} - {data.artist.died})</p>
        <p><b>Gallery:</b> {data.gallery.name} ({data.gallery.city}, {data.gallery.country}){data.gallery.since ? ' since ' + data.gallery.since : null}</p>
        <Link to="/edit">
            <button>Edit</button>
        </Link>
        <button onClick={deleteArt}>Delete</button>
      </div>
    );
  }
  else {
    return(
      <div>
        <Link to="/">
            <button>Back to Home</button>
        </Link>
      </div>
    );
  }
}