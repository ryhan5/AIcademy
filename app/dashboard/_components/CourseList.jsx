"use client"

import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import CourseCardItem from './CourseCardItem';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCountContext } from '@/app/_context/CourseCountContext';

function CourseList() {


    // const {user}=useUser(); // Removed user hook

    const [CourseList,setCourseList]=useState([])

    const [loading,setLoading]=useState(false)

    const {totalCourse,setTotalCourse}=useContext(CourseCountContext)


    useEffect(() => {
        // Fetch on mount
        GetCourseList();
        // Poll every 5 seconds
        const interval = setInterval(() => {
            GetCourseList();
        }, 5000);
        return () => clearInterval(interval);
    }, []); // Empty dependency array means run once on mount

    const GetCourseList=async()=>{

        setLoading(true)

        // Fetch all courses, removed createdBy filter
        try {
            const result = await axios.post('/api/courses', {});
            console.log(result);
            setCourseList(result.data.result);
            setTotalCourse(result.data.result?.length)
        } catch (error) {
            console.error('Error fetching course list:', error);
            // Optionally show a toast or alert here
        }
        setLoading(false)
    }


  return (
    <div className='mt-10'>
        <h2 className='font-bold text-2xl flex justify-between items-center'>Your Study Material
            <Button variant="outline" onClick={GetCourseList} className="border-primary text-primary"> <RefreshCw/> Refresh</Button>
        </h2>

        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mt-2 gap-5'>
            { loading==false? CourseList?.map((course,index)=>(
                <CourseCardItem course={course} key={index}/>
            ))
        :[1,2,3,4,5,6].map((item,index)=>(
            <div key={index} className='h-56 w-full bg-slate-200 rounded-lg animate-pulse'>

            </div>
        ))
        }
        </div>
    </div>
  )
}

export default CourseList