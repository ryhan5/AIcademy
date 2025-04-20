import { Button } from '@/components/ui/button'
import axios from 'axios'
import { RefreshCcw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'sonner'

function MaterialCardItem({ item, studyTypeContent, course, refreshData }) {
  const [loading, setLoading] = useState(false)

  const GenerateContent = async () => {
    try {
      toast('Starting content generation...')
      setLoading(true)
      
      // Format chapters data
      let chapters = '';
      
      if (course?.courseLayout?.chapters) {
        if (item.type === 'notes') {
          // For notes, we need to send the entire chapter data
          const chaptersData = course.courseLayout.chapters.map(chapter => {
            return {
              chapterTitle: chapter.chapterTitle || '',
              chapterSummary: chapter.chapterSummary || '',
              topics: chapter.topics || []
            };
          });
          chapters = JSON.stringify(chaptersData);
        } else {
          // For other types, concatenate chapter titles
          course.courseLayout.chapters.forEach((chapter) => {
            chapters = (chapter.chapterTitle || '') + ',' + chapters;
          });
        }
      } else {
        // Fallback if chapters are not available
        chapters = course?.topic || 'general course content';
      }
      
      console.log("Sending chapters data:", chapters.substring(0, 100) + "...");

      // Make API request to generate content
      const result = await axios.post('/api/study-type-content', {
        courseId: course?.courseId,
        type: item.type || item.name, // Use type first, fall back to name
        chapters: chapters
      });

      console.log("API response:", result.data);
      
      // Show a toast that content is being generated
      toast.success('Content generation initiated. This may take a moment.');
      
      // Poll for content generation status
      let contentReady = false;
      let attempts = 0;
      
      while (!contentReady && attempts < 10) {
        // Wait 3 seconds between checks
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          // Check if content is ready
          const statusCheck = await axios.post('/api/study-type', {
            courseId: course?.courseId,
            studyType: item.type || item.name
          });
          
          console.log("Status check:", statusCheck.data);
          
          if (
            (item.type === 'notes' && statusCheck.data && statusCheck.data.length > 0) || 
            (item.type !== 'notes' && statusCheck.data?.content && !statusCheck.data.error)
          ) {
            contentReady = true;
            toast.success('Your content is ready to view!');
            refreshData(true);
            break;
          } else if (attempts >= 9) {
            toast.info('Content is still being generated. Please check back in a moment.');
          }
        } catch (error) {
          console.error("Error checking content status:", error);
        }
        
        attempts++;
      }
      
      refreshData(true);
      setLoading(false);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error('Failed to generate content. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Link href={'/course/' + course?.courseId + item.path}>
      <div className={`border shadow-md rounded-lg p-5 flex flex-col items-center 
      ${studyTypeContent?.[item.type]?.length == null && 'grayscale'}
      `}>

        {studyTypeContent?.[item.type]?.length == null || studyTypeContent?.[item.type]?.length == 0 ?
          <h2 className='p-1 px-2 bg-gray-500 text-white rounded-full text-[10px] mb-2'>Generate</h2>
          : <h2 className='p-1 px-2 bg-green-500 text-white rounded-full text-[10px] mb-2'>Ready</h2>
        }

        <Image src={item.icon} alt={item.name} width={50} height={50} />
        <h2 className='font-medium mt-3'>{item.name}</h2>
        <p className='text-gray-500 text-sm text-center'>{item.desc}</p>

        {studyTypeContent?.[item.type]?.length == null || studyTypeContent?.[item.type]?.length == 0 ?
          <Button className='mt-3 w-full' variant="outline" onClick={(e) => {
            e.preventDefault(); // Prevent navigation when clicking generate
            GenerateContent();
          }}>
            {loading && <RefreshCcw className='animate-spin mr-2' />}
            {loading ? 'Generating...' : 'Generate'}
          </Button>
          : <Button className='mt-3 w-full' variant="outline">View</Button>
        }
      </div>
    </Link>
  )
}

export default MaterialCardItem