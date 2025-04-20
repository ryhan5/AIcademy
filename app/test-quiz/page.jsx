'use client'

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import QuizCardItem from '../course/[courseId]/quiz/_components/QuizCardItem';
import { Button } from '@/components/ui/button';

function TestQuiz() {
  const router = useRouter();
  const [quizData, setQuizData] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [isCorrectAns, setIsCorrectAnswer] = useState(null);
  const [correctAns, setCorrectAns] = useState();
  const [score, setScore] = useState(0);
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    getTestQuiz();
  }, []);

  const getTestQuiz = async () => {
    try {
      setLoading(true);
      // Use our test API endpoint
      const result = await axios.get('/api/test-quiz');
      
      console.log('Test Quiz API Response:', result.data);
      
      // Save debug info
      setDebugInfo({
        rawResponse: JSON.stringify(result.data, null, 2),
        hasContent: !!result.data?.content,
        contentType: typeof result.data?.content,
        hasQuestions: !!result.data?.content?.questions,
        questionsLength: result.data?.content?.questions?.length || 0
      });
      
      setQuizData(result.data);
      setQuiz(result.data?.content?.questions || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching test quiz:', err);
      setError('Failed to load test quiz: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const checkAnswer = (userAnswer, currentQuestion) => {
    setCorrectAns(currentQuestion?.correctAnswer);

    if (userAnswer === currentQuestion?.correctAnswer) {
      setIsCorrectAnswer(true);
      setScore((prev) => prev + 1);
    } else {
      setIsCorrectAnswer(false);
    }
    setIsOptionSelected(true);
  };

  const nextQuestion = () => {
    setStepCount((prev) => prev + 1);
    setCorrectAns(null);
    setIsCorrectAnswer(null);
    setIsOptionSelected(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className='font-bold text-3xl mb-2'>Test Quiz</h1>
      <p className='text-gray-600 mb-6'>This page uses hardcoded quiz data to test the component</p>

      {loading ? (
        <div className="text-center p-10">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading test quiz...</p>
        </div>
      ) : error ? (
        <div className="text-center p-10">
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
          <button 
            onClick={getTestQuiz} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : quiz.length === 0 ? (
        <div className="text-center p-10">
          <p className="mb-4">No quiz questions available.</p>
          
          {/* Debug information for developers */}
          {debugInfo && (
            <div className="mt-8 text-left bg-gray-100 p-4 rounded overflow-auto max-h-96">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <p>Has Content: {debugInfo.hasContent ? 'Yes' : 'No'}</p>
              <p>Content Type: {debugInfo.contentType}</p>
              <p>Has Questions: {debugInfo.hasQuestions ? 'Yes' : 'No'}</p>
              <p>Questions Length: {debugInfo.questionsLength}</p>
              <div className="mt-2">
                <p className="font-bold">Raw Response:</p>
                <pre className="text-xs mt-2 whitespace-pre-wrap">
                  {debugInfo.rawResponse}
                </pre>
              </div>
            </div>
          )}
          
          <button 
            onClick={getTestQuiz} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : stepCount < quiz.length ? (
        <div>
          <div className="bg-blue-50 p-4 mb-6 rounded">
            <p>Question {stepCount + 1} of {quiz.length}</p>
            <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${((stepCount + 1) / quiz.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <QuizCardItem
            quiz={quiz[stepCount]}
            userSelectedOption={(v) => {
              if (!isOptionSelected) {
                checkAnswer(v, quiz[stepCount]);
              }
            }}
          />
          
          {isCorrectAns === false && (
            <div className='border p-3 border-red-700 bg-red-200 mt-4'>
              <h2 className='font-bold text-lg text-red-600'>Incorrect</h2>
              <p className='text-red-600'>Correct Answer is: {correctAns}</p>
            </div>
          )}

          {isCorrectAns === true && (
            <div className='border p-3 border-green-700 bg-green-200 mt-4'>
              <h2 className='font-bold text-lg text-green-600'>Correct</h2>
              <p className='text-green-600'>Your answer is correct</p>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              className={`px-6 py-2 font-bold text-white rounded ${
                isOptionSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
              }`}
              disabled={!isOptionSelected}
              onClick={nextQuestion}
            >
              Next Question
            </button>
          </div>
        </div>
      ) : (
        <div className='text-center mt-8 p-8 bg-green-50 rounded-lg'>
          <h2 className='font-bold text-2xl'>Quiz Completed!</h2>
          <p className='text-lg mt-4'>Your final score is: {score}/{quiz.length}</p>
          <p className='mt-2'>That's {Math.round((score / quiz.length) * 100)}%</p>
          <div className="mt-6">
            <Button onClick={() => setStepCount(0)} className="mr-4">Start Over</Button>
            <Button onClick={() => router.push('/')} variant="outline">Go Home</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestQuiz; 