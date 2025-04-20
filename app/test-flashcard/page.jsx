'use client'

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Flashcarditem from '../course/[courseId]/flashcard/_components/Flashcarditem';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function TestFlashcards() {
  const [flashCards, setFlashCards] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [api, setApi] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTestFlashCards();
  }, []);

  useEffect(() => {
    if (!api) return;
    
    api.on('select', () => {
      setIsFlipped(false);
    });
  }, [api]);

  const getTestFlashCards = async () => {
    try {
      setLoading(true);
      // Use our test API endpoint
      const result = await axios.get('/api/test-flashcard');
      
      console.log('Test FlashCard API Response:', result.data);
      
      setFlashCards(result?.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching test flashcards:', err);
      setError('Failed to load test flashcards: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  // Function to determine if we have valid flashcard data
  const hasValidFlashcards = () => {
    return flashCards?.content && Array.isArray(flashCards.content) && flashCards.content.length > 0;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className='font-bold text-3xl mb-2'>Test FlashCards</h1>
      <p className='text-gray-600 mb-6'>This page uses hardcoded flashcards to test the component</p>

      {loading ? (
        <div className="text-center p-10">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading test flashcards...</p>
        </div>
      ) : error ? (
        <div className="text-center p-10">
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
          <button 
            onClick={getTestFlashCards} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : !hasValidFlashcards() ? (
        <div className="text-center p-10">
          <p className="mb-4">No test flashcards available.</p>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(flashCards, null, 2)}
          </pre>
          <button 
            onClick={getTestFlashCards} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <p className="text-green-700">✅ Found {flashCards.content.length} flashcards</p>
          </div>
          
          <Carousel setApi={setApi}>
            <CarouselContent>
              {flashCards.content.map((flashcard, index) => (
                <CarouselItem key={index} className='flex items-center justify-center my-10'>
                  <Flashcarditem 
                    handleClick={handleClick}
                    isFlipped={isFlipped}
                    flashcard={flashcard} 
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}

export default TestFlashcards; 