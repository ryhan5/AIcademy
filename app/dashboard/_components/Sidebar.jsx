"use client"

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LayoutDashboard, Shield, UserCircle } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useContext } from 'react'
import Link from 'next/link'
import { CourseCountContext } from '@/app/_context/CourseCountContext'


function Sidebar() {

  const MenuList=[
    {
      name:'Dashboard',
      icon:LayoutDashboard,
      path:'/dashboard'
    },
    {
      name:'Career Insights',
      icon:UserCircle,
      path:'/insights'
    }
  ]

  const {totalCourse,setTotalCourse}=useContext(CourseCountContext)

  const path=usePathname();

  return (
    <div className='h-screen shadow-md p-5'>

        <div className='flex gap-2 item-center'>
        
        <a href="/dashboard"> <img src="./logo.jpeg" alt="" className='w-10 h-10 object-cover rounded-full' /></a>
       
            
            <h2 className='font-bold text-2xl '>AIcademy</h2>

        </div>

        <div className='mt-10'>
            
            <Link href={'/create'} className='w-full'>
            <Button className='w-full'>Create new</Button>
            </Link>
            

            <div className='mt-5'>
              {MenuList.map((menu,index)=>(
                <Link href={menu.path} key={index}>

                <div key={index} className={`flex gap-5 items-center p-3 hover:bg-slate-200 rounded-lg cursor-pointer ${path==menu.path && 'bg-slate-200'}`}>

                  <menu.icon/>
                  <h2>
                    {menu.name}
                  </h2>

                </div>
                </Link>

              ))}
            </div>
            
            
        </div>

        <div className='border p-3 bg-slate-100 rounded-lg absolute bottom-10 w-[85%]'>
          <h2 className='text-lg'>Available Credits:{(5-totalCourse)}</h2>
          <Progress value={(totalCourse/5)*100}/>
          <h2 className='text-sm'>{totalCourse} out of 5 credits used</h2>

         

 <Link href={'/dashboard/upgrade'} className='text-primary text-xs'> Upgrade to create more courses </Link>
         
          
        </div>

    </div>
  )
}

export default Sidebar