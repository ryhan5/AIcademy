import React from 'react'
import ReactCardFlip from 'react-card-flip'
import './style.css'

function Flashcarditem({ isFlipped, handleClick, flashcard }) {
  // Handle null or undefined flashcard gracefully
  if (!flashcard) {
    return (
      <div className="flip-container">
        <div className="flip-card front">
          <h2>No flashcard data available</h2>
        </div>
      </div>
    );
  }
  
  // Extract front and back content based on the available data structure
  const getFrontContent = () => {
    // Check different possible property names for front content
    if (flashcard.front) return flashcard.front;
    if (flashcard.question) return flashcard.question;
    if (flashcard.title) return flashcard.title;
    
    // If we have a string, just use the whole thing
    if (typeof flashcard === 'string') return flashcard;
    
    // Last resort - convert the object to a string
    if (typeof flashcard === 'object') {
      const keys = Object.keys(flashcard);
      if (keys.length > 0) return flashcard[keys[0]];
    }
    
    return 'Front side content missing';
  };
  
  const getBackContent = () => {
    // Check different possible property names for back content
    if (flashcard.back) return flashcard.back;
    if (flashcard.answer) return flashcard.answer;
    if (flashcard.description) return flashcard.description;
    if (flashcard.content) return flashcard.content;
    
    // If we have an object but no recognized back property
    if (typeof flashcard === 'object') {
      const keys = Object.keys(flashcard);
      if (keys.length > 1) return flashcard[keys[1]];
    }
    
    return 'Back side content missing';
  };
  
  const frontContent = getFrontContent();
  const backContent = getBackContent();
  
  return (
    <div className="flip-container">
      <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
        <div
          className="flip-card front"
          onClick={handleClick}
        >
          <h2>{frontContent}</h2>
        </div>
    
        <div
          className="flip-card back"
          onClick={handleClick}
        >
          <h2>{backContent}</h2>
        </div>
      </ReactCardFlip>
    </div>
  )
}

export default Flashcarditem