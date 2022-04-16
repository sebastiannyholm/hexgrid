import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';

function GameModal({ headerText, bodyText, footerText }) {
  return (
    <div id="winnerModal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{headerText}</h2>
        </div>
        <div className="modal-body">
          <p>{bodyText}</p>
        </div>
        <div className="modal-footer">
          <h3>{footerText}</h3>
        </div>
      </div>
      <div>
        <button>ad</button>
        <button>de</button>
      </div>
    </div>
  );
}

export default GameModal;
