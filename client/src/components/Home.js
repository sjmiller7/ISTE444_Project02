import React, { useEffect, useState } from 'react';
import Preview from './Preview';

export default function Home(props) {
    let [data, setData] = useState([]);
    
    useEffect(() => {
        if (!data || data.length==0) {
            callBackendAPI()
            .then(res => setData(res.art) )
            .catch(err => console.log(err));
        }
          return () => {}
    });

    async function callBackendAPI() {
        const response = await fetch('/gallery/view?username=' + props.username);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
    };

  return(
    <div>
        <div className='cardBg headingCard'>
          <h2>Browse Art</h2>
        </div>
        <div className='cardsContainer'>
          {data && data.length>0 && data.map(art => {return( <Preview art={art}/>)} )}
        </div>
    </div>
  );
}