"use client"

import React, { useState } from 'react'
import SelectOption from './_components/SelectOption'
import { Button } from '@/components/ui/button';
import TopicInput from './_components/TopicInput';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Header from '../dashboard/Header';

function Create() {
    const [step,setStep]=useState(0);
    const [formData, setFormData] = useState([]);
    const [loading,setLoading]=useState(false);
    const router=useRouter();

    const handleUserInput=(fieldName,fieldValue)=>{
        setFormData(prev=>({
            ...prev,
            [fieldName]:fieldValue 
        }));
        console.log(formData);
    }

    const GenerateCourseOutline=async ()=>{
        try {
            const courseId=uuidv4();
            setLoading(true);
            console.log("Sending data to API:", {
                courseId,
                ...formData,
                createdBy: "testuser@example.com"
            });
            
            const result = await axios.post('/api/generate-course-outline',{
                courseId: courseId,
                ...formData,
                // TODO: Replace with real user email after auth integration
                createdBy: "testuser@example.com"
            });
            
            console.log("API Response:", result.data);
            
            // Success
            toast.success("Your course is being generated!");
            router.replace('/dashboard');
        } catch (error) {
            console.error("Error generating course:", error);
            
            // Show error message
            const errorMessage = error.response?.data?.error || "Failed to generate course";
            toast.error(errorMessage);
            
            setLoading(false);
        }
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-10">
        <div className='flex flex-col items-center p-5 md:px-24 lg:px-36'>
            <h2 className='font-bold text-4xl text-primary'>Start creating course with using dilshad technology</h2>
            <p className='text-gray-500 text-lg'>Fill all details to generate the course</p>

            <div className='mt-10 w-full max-w-2xl'>
                {step==0?
                <SelectOption selectedStudyType={(value)=>handleUserInput('courseType',value)} />
                :<TopicInput 
                setTopic={(value)=>handleUserInput('topic',value)}
                setDifficultyLevel={(value)=>handleUserInput('difficultyLevel',value)}
                
                />}
                
            </div>

            <div className='flex justify-between w-full max-w-2xl mt-32'>
                {step!=0?  <Button variant="outline" onClick={()=>setStep(step-1)}>Previous</Button>:
                ' .'}
                {step==0?<Button onClick={()=>setStep(step+1)}>Next</Button>
                :
                <Button onClick={GenerateCourseOutline} disabled={loading} >
                    {loading?<Loader className='animate-spin' />:'Generate'}
        
                </Button>}
            </div>
        </div>
      </div>
    </div>
  )
}

export default Create