// src/components/LocalFileUploader.js

import React, { useRef } from 'react';

const LocalFileUploader = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
    // Réinitialiser pour pouvoir re-téléverser le même fichier
    event.target.value = null;
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="local-file-uploader">
      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <button onClick={handleClick} className="upload-button" disabled={disabled}>
        Choisir un fichier audio
      </button>
    </div>
  );
};

export default LocalFileUploader;