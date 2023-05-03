import React from 'react';
import { Link } from 'react-router-dom';

export default function Preview(props) {
    return(
        <div>
            <img src={props.art.img}></img>
            <h3>{props.art.name} ({props.art.created})</h3>
            <p>{props.art.artist}</p>
            <p>{props.art.gallery}</p>
            <Link to="/view" state={{ id: props.art.id }}>
                <button>View More</button>
            </Link>
        </div>
    );
}