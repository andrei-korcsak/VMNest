import React from 'react';
import './HeaderComponent.css';

function HeaderComponent({ title }) {
    return (
        <div className="header">
            <h1 className="header-title">{title}</h1>
        </div>
    );
}

export default HeaderComponent;