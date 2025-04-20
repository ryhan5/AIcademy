'use client'

import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import StepProgress from '../_components/StepProgress';
import QuizCardItem from './_components/QuizCardItem';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Quiz() {
  const router = useRouter();
  const { courseId } = useParams();
  const [quizData, setQuizData] = useState();
  const [quiz, setQuiz] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [isCorrectAns, setIsCorrectAnswer] = useState(null);
  const [correctAns, setCorrectAns] = useState();
  const [score, setScore] = useState(0); 
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [insertingTest, setInsertingTest] = useState(false);

  useEffect(() => {
    GetQuiz();
  }, []);

  const GetQuiz = async () => {
    try {
      setLoading(true);
      if (error) setError(null);
      
      const result = await axios.post('/api/study-type', {
        courseId: courseId,
        studyType: 'Quiz',
      });
      
      console.log('Quiz API Response:', result.data);
      
      // Save debug information
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
      console.error('Error fetching quiz:', err);
      setError('Failed to load quiz: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };
  
  // Insert test quiz data into the database
  const handleInsertTestQuiz = async () => {
    try {
      setInsertingTest(true);
      const result = await axios.post('/api/insert-test-quiz', {
        courseId: courseId
      });
      
      console.log('Inserted test quiz:', result.data);
      alert('Test quiz inserted successfully! Click refresh to view it.');
      setInsertingTest(false);
    } catch (err) {
      console.error('Error inserting test quiz:', err);
      alert('Error inserting test quiz: ' + (err.message || 'Unknown error'));
      setInsertingTest(false);
    }
  };

  const checkAnswer = (userAnswer, currentQuestion) => {
    setCorrectAns(currentQuestion?.correctAnswer);

    if (userAnswer === currentQuestion?.correctAnswer) {
      setIsCorrectAnswer(true);
      setScore((prev) => prev + 1); // Increment score if correct
    } else {
      setIsCorrectAnswer(false);
    }
    setIsOptionSelected(true); // Mark the option as selected
  };

  const nextQuestion = () => {
    setStepCount((prev) => prev + 1);
    setCorrectAns(null);
    setIsCorrectAnswer(null);
    setIsOptionSelected(false); // Reset option selection for the next question
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className='font-bold text-2xl'>Quiz</h2>
        <div className="flex space-x-3">
          <button 
            onClick={GetQuiz} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            Refresh Quiz
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      ) : error ? (
        <div className="text-center p-10">
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
          <button 
            onClick={GetQuiz} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : quiz.length === 0 ? (
        <div className="text-center p-10">
          <p className="mb-4">No quiz questions available yet. Quiz is being generated for this course.</p>
          
          <button 
            onClick={GetQuiz} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : stepCount < quiz.length ? (
        <>
          <StepProgress data={quiz} stepCount={stepCount} setStepCount={nextQuestion} />

          <div>
            <QuizCardItem
              quiz={quiz[stepCount]}
              userSelectedOption={(v) => {
                if (!isOptionSelected) {
                  checkAnswer(v, quiz[stepCount]);
                }
              }}
            />
          </div>

          {isCorrectAns === false && (
            <div className='border p-3 border-red-700 bg-red-200'>
              <h2 className='font-bold text-lg text-red-600'>Incorrect</h2>
              <p className='text-red-600'>Correct Answer is: {correctAns}</p>
            </div>
          )}

          {isCorrectAns === true && (
            <div className='border p-3 border-green-700 bg-green-200'>
              <h2 className='font-bold text-lg text-green-600'>Correct</h2>
              <p className='text-green-600'>Your answer is correct</p>
            </div>
          )}

          <button
            className={`mt-4 px-4 py-2 font-bold text-white rounded ${
              isOptionSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
            }`}
            disabled={!isOptionSelected}
            onClick={nextQuestion}
          >
            Next Question
          </button>
        </>
      ) : (
        <div className='text-center mt-8'>
          <h2 className='font-bold text-2xl'>Quiz Completed</h2>
          <p className='text-lg'>Your final score is: {score}/{quiz.length}</p>
          <Button onClick={()=>router.back()} className="mt-4">Go to course Page</Button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
