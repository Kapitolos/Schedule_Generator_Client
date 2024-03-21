import React, { useState } from 'react';
import jpgif from './jp.gif'; // Adjust the path as necessary

function FireTom() {
  const [showGif, setShowGif] = useState(false);

  const handleClick = () => {
    setShowGif(true); // Show the GIF

    // Set a timer to hide the GIF after 3 seconds (3000 milliseconds)
    setTimeout(() => {
      setShowGif(false); // Reset the state to hide the GIF
    }, 3000);
  };

  return (
    <div>
      <button id="FireTom" onClick={handleClick} disabled={showGif}>Fire Tom</button>
      {showGif && <div className="gif-container"><img src={jpgif} alt="Funny GIF" /></div>}
    </div>
  );
}

export default FireTom;
