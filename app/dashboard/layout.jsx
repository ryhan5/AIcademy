'use client';

import React, { useState } from 'react';
import Sidebar from './_components/Sidebar';
import Header from './Header';
import { CourseCountContext } from '../_context/CourseCountContext';

function DashboardLayout({ children }) {
  const [totalCourse, setTotalCourse] = useState(0);

  return (
    <CourseCountContext.Provider value={{ totalCourse, setTotalCourse }}>
      <div>
        <Header />
        <div className='md:w-64 hidden md:block fixed top-20'>
          <Sidebar />
        </div>
        <div className='md:ml-64 pt-24'>
          <div className='p-5'>
            {children}
          </div>
        </div>
      </div>
    </CourseCountContext.Provider>
  );
}

export default DashboardLayout;
