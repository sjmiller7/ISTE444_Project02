import React, { useEffect, useState } from 'react';
import Preview from './Preview';

export default function Home() {
    let [data, setData] = useState([])
    
    useEffect(() => {
        callBackendAPI()
          .then(res => setData(res.art) )
          .catch(err => console.log(err));
        console.log(data)

          return () => {}
    });

    async function callBackendAPI() {
        const response = await fetch('/gallery/view');
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
    };

  return(
    <div>
        <h2>Browse Art</h2>
        <p>{data.length>0 && data.map(art => {return( <Preview art={art}/>)} )}</p>
    </div>
  );
}