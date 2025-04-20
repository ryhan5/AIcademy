import React from 'react'
import Header from '../dashboard/Header'

function CourseViewLayout({children}) {
  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
        <div className='pt-24 mx-10 md:mx-36 lg:px-60'>
            {children}
        </div>
    </div>
  )
}

export default CourseViewLayout