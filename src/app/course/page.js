'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseInput from '@/components/CourseInput';
import CourseView from '@/components/CourseView';
import Link from 'next/link';

import { Suspense } from 'react';
import CourseContent from './CourseContent';

export default function CoursePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">Loading...</div>}>
            <CourseContent />
        </Suspense>
    );
}
