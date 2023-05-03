import React from 'react';
import { Link } from 'react-router-dom';

export default function Preview(props) {
    return(
        <div className='preview cardBg'>
            <div className='img'>
                <img src={props.art.img}></img>
            </div>
            <h3>{props.art.name} ({props.art.created})</h3>
            <p><b>Artist:</b> {props.art.artist}</p>
            <p><b>Gallery:</b> {props.art.gallery}</p>
            <Link to="/view" state={{ id: props.art.id }}>
                <button>View More</button>
            </Link>
        </div>
    );
}