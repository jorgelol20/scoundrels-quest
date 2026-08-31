import React from 'react';
import './Loading.css';

const Loading = ({ message = "Cargando..." }) => {
  return (
    <div className="container">
      <div className="loader" role="status">
        <span className="sr-only">{message}</span>
      </div>
      {message && <p className="medieval-text">{message}</p>}
    </div>
  );
};

export default Loading;