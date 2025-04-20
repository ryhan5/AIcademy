'use client'

import axios from 'axios'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Flashcarditem from './_components/Flashcarditem';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from 'next/link';

function Flashcards() {
  const { courseId } = useParams();
  const [flashCards, setFlashCards] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [api, setApi] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [insertingTest, setInsertingTest] = useState(false);

  useEffect(() => {
    GetFlashCards();
  }, []);

  useEffect(() => {
    if (!api) return;
    
    api.on('select', () => {
      setIsFlipped(false);
    });
  }, [api]);

  const GetFlashCards = async () => {
    try {
      setLoading(true);
      const result = await axios.post('/api/study-type', {
        courseId: courseId,
        studyType: 'FlashCard'
      });
      
      // Save the raw API response for debugging
      setDebugInfo({
        rawResponse: JSON.stringify(result.data, null, 2),
        hasContent: !!result.data?.content,
        contentType: result.data?.content ? (Array.isArray(result.data.content) ? 'array' : typeof result.data.content) : 'none',
        contentLength: Array.isArray(result.data?.content) ? result.data.content.length : 'not array'
      });
      
      console.log('FlashCard API Response:', result.data);
      
      // Set the flashcards data
      setFlashCards(result?.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError('Failed to load flashcards: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Manual refresh button handler
  const handleRefresh = () => {
    GetFlashCards();
  };
  
  // Insert test flashcards directly into the database
  const handleInsertTestFlashcards = async () => {
    try {
      setInsertingTest(true);
      const result = await axios.post('/api/insert-test-flashcard', {
        courseId: courseId
      });
      
      console.log('Inserted test flashcards:', result.data);
      alert('Test flashcards inserted successfully! Click refresh to view them.');
      setInsertingTest(false);
    } catch (err) {
      console.error('Error inserting test flashcards:', err);
      alert('Error inserting test flashcards: ' + (err.message || 'Unknown error'));
      setInsertingTest(false);
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className='font-bold text-3xl'>FlashCards</h2>
          <p className='text-gray-600'>The Ultimate tool to check concepts</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            Refresh Cards
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading flashcards...</p>
        </div>
      ) : error ? (
        <div className="text-center p-10">
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
          <button 
            onClick={handleRefresh} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : !hasValidFlashcards() ? (
        <div className="text-center p-10">
          <p className="mb-4">No flashcards available yet. Flashcards are being generated for this course.</p>
          
          <button 
            onClick={handleRefresh} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div>
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

export default Flashcards