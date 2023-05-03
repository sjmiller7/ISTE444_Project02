import React, { useState, useEffect }  from 'react';
import { Navigate } from 'react-router-dom';
import Select from './Select';

export default function Donate(props) {
  // Form variables
  const [name, setName] = useState();
  const [img, setImg] = useState();
  const [style, setStyle] = useState();
  const [media, setMedia] = useState();
  const [type, setType] = useState();
  const [created, setCreated] = useState();
  const [artistID, setArtistID] = useState();
  const [since, setSince] = useState();
  const [galleryID, setGalleryID] = useState();

  // Select data
  const [artists, setArtists] = useState();
  const [galleries, setGalleries] = useState();

  // Art id once submitted
  const [artID, setArtID] = useState(false);


  useEffect(() => {
    if(!artists || !galleries) {
    getArtists()
          .then(res => setArtists(res) )
          .catch(err => console.log(err));
    getGalleries()
          .then(res => setGalleries(res) )
          .catch(err => console.log(err));
    }
    return () => {}
  });

  async function getArtists() {
      const response = await fetch('/gallery/artists?username=' + props.username);
      const body = await response.json();
      if (response.status !== 200) {
        throw Error(body.message) 
      }
      return body;
  };

  async function getGalleries() {
      const response = await fetch('/gallery/galleries?username=' + props.username);
      const body = await response.json();
      if (response.status !== 200) {
        throw Error(body.message) 
      }
      return body;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/gallery/donate', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: props.username,
        artistID: artistID,
        galleryID: galleryID,
        created: created,
        artProperties: {
          name: name,
          img: img,
          style: style,
          media: media,
          type: type
        },
        since: since
      })
    });
    const body = await response.json();
    if (response.status !== 200) {
      console.log(body.message) 
    }
    setArtID(body.id)
    return '';
  }

  if (artID) {
    return (
      <Navigate to="/view" replace={true} state={{ id: artID }} />
    );
  }
  else if(artists && galleries) {
    return(
      <div>
        <h2>New Art</h2>
        <form onSubmit={handleSubmit}>
          <label>
              <p>Name</p>
              <input type="text" required onChange={e => setName(e.target.value)} />
          </label>
          <label>
              <p>Img (URL)</p>
              <input type="text" required onChange={e => setImg(e.target.value)} />
          </label>
          <label>
              <p>Style</p>
              <input type="text" onChange={e => setStyle(e.target.value)} />
          </label>
          <label>
              <p>Media</p>
              <input type="text" required onChange={e => setMedia(e.target.value)} />
          </label>
          <label>
              <p>Type</p>
              <input type="text" required onChange={e => setType(e.target.value)} />
          </label>
          <label>
            <p>Artist</p>
            <select required onChange={e => setArtistID(parseInt(e.target.value))}>
              <option>Select</option>
              {artists && artists.artists.length>0 && artists.artists.map(artist => {return( <Select data={artist}/>)} )}
            </select>
          </label>
          <label>
              <p>Year created</p>
              <input type="text" required onChange={e => setCreated(e.target.value)} />
          </label>
          <label>
            <p>Gallery</p>
            <select required onChange={e => setGalleryID(parseInt(e.target.value))}>
              <option>Select</option>
              {galleries && galleries.galleries.length>0 && galleries.galleries.map(gallery => {return( <Select data={gallery}/>)} )}
            </select>
          </label>
          <label>
              <p>Year entered the gallery</p>
              <input type="text" onChange={e => setSince(e.target.value)} />
          </label>
          <div>
              <button type="submit">Create</button>
          </div>
        </form>
      </div>
    );
  }
  else {
    return(
      <div>
        <h2>New Art</h2>
      </div>
    );
  }
}