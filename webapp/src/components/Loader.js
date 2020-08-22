import React from 'react';
import './Loader.css';

function Loader(props) {
    return (
        <div id="loader">
            <div id="spinner"/> <span id="text">{props.children}</span>
        </div>
    );
}

export default Loader;