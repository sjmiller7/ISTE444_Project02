import React from 'react';

export default function Home(art) {
    return(
        <div>
            <img src={art.art.img}></img>
            <h3>{art.art.name} ({art.art.created})</h3>
            <p>{art.art.artist}</p>
            <p>{art.art.gallery}</p>
            <button data-id={art.art.id}>View More</button>
        </div>
    );
}