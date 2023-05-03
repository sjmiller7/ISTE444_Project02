import React, { useState, useEffect }  from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Select from './Select';

export default function Curate(props) {
  // Data from existing entity
  let { state } = useLocation();

  // Form variables
  const [name, setName] = useState(state.data.name);
  const [img, setImg] = useState(state.data.img);
  const [style, setStyle] = useState(state.data.style);
  const [media, setMedia] = useState(state.data.media);
  const [type, setType] = useState(state.data.type);
  const [created, setCreated] = useState(state.data.created);
  const [artistID, setArtistID] = useState();
  const [since, setSince] = useState(state.data.gallery.since);
  const [galleryID, setGalleryID] = useState();

  // Select data
  const [artists, setArtists] = useState();
  const [galleries, setGalleries] = useState();

  // Submission status
  const [submitted, setSubmitted] = useState(false);

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
    const response = await fetch('/gallery/curate', {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: props.username,
        artistID: artistID,
        galleryID: galleryID,
        created: created,
        artProperties: {
          id: state.data.id,
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
    setSubmitted(body.id)
    return '';
  }

  if (submitted) {
    return (
      <Navigate to="/view" replace={true} state={{ id: submitted }} />
    );
  }
  else if(artists && galleries) {
    return(
      <div className='cardBg formBox'>
        <h2>Edit "{state.data.name}"</h2>
        <form onSubmit={handleSubmit}>
          <label>
              <p>Name</p>
              <input type="text" defaultValue={state.data.name} required onChange={e => setName(e.target.value)} />
          </label>
          <label>
              <p>Img (URL)</p>
              <input type="text" defaultValue={state.data.img} required onChange={e => setImg(e.target.value)} />
          </label>
          <label>
              <p>Style</p>
              <input type="text" defaultValue={state.data.style ? state.data.style : ''} onChange={e => setStyle(e.target.value)} />
          </label>
          <label>
              <p>Media</p>
              <input type="text" defaultValue={state.data.media} required onChange={e => setMedia(e.target.value)} />
          </label>
          <label>
              <p>Type</p>
              <input type="text" defaultValue={state.data.type} required onChange={e => setType(e.target.value)} />
          </label>
          <label>
            <p>Artist</p>
            <select required onChange={e => setArtistID(parseInt(e.target.value))}>
              <option value="">Select</option>
              {artists.artists.length>0 && artists.artists.map(artist => {return( <Select data={artist}/>)} )}
            </select>
          </label>
          <label>
              <p>Year created</p>
              <input type="text" defaultValue={state.data.created} required onChange={e => setCreated(e.target.value)} />
          </label>
          <label>
            <p>Gallery</p>
            <select required onChange={e => setGalleryID(parseInt(e.target.value))}>
              <option value="">Select</option>
              {galleries.galleries.length>0 && galleries.galleries.map(gallery => {return( <Select data={gallery}/>)} )}
            </select>
          </label>
          <label>
              <p>Year entered the gallery</p>
              <input type="text" defaultValue={state.data.gallery.since ? state.data.gallery.since : ''} onChange={e => setSince(e.target.value)} />
          </label>
          <div>
              <button type="submit">Curate</button>
          </div>
        </form>
      </div>
    );
  }
  else {
    return(
      <div>
        <h2>Edit Art</h2>
      </div>
    );
  }
}