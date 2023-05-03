import React from 'react';

export default function Select(props) {
    return(
        <option value={props.data.id}>{props.data.name}</option>
    );
}