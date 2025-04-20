import axios from 'axios'
import React, { useEffect, useState } from 'react'
import MaterialCardItem from './MaterialCardItem'
import Link from 'next/link'

function StudyMaterialSection({courseId, course}) {
    const [studyTypeContent, setStudyTypeContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const MaterialList = [
        {
            name: 'Notes/chapters',
            desc: '"Your ultimate study guide, one note at a time!"',
            icon: '/download5.png',
            path: '/notes',
            type: 'notes'
        },
        {
            name: 'FlashCard',
            desc: '"Learn faster, one flip at a time!"',
            icon: '/download5.png',
            path: '/flashcard',
            type: 'FlashCard'
        },
        {
            name: 'Quiz',
            desc: '"Test your knowledge, ace your goals!"',
            icon: '/download5.png',
            path: '/quiz',
            type: 'Quiz'
        },
        {
            name: 'Question/Answer',
            desc: 'Read notes to prepare it',
            icon: '/download5.png',
            path: '/qa',
            type: 'QA'
        }
    ];

    useEffect(() => {
        GetStudyMaterial();
    }, []);

    const GetStudyMaterial = async (forceRefresh = false) => {
        try {
            setLoading(true);
            if (error) setError(null);
            
            const result = await axios.post('/api/study-type', {
                courseId: courseId,
                studyType: 'ALL'
            });

            console.log("Study material data:", result?.data);
            setStudyTypeContent(result.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching study material:", err);
            setError("Failed to load study materials. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className='mt-3'>
            <h2 className='font-medium text-xl'>Study Material</h2>
            
            {error && (
                <div className="p-3 my-2 text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <div className='grid grid-cols-2 md:grid-cols-4 gap-5 mt-3'>
                {MaterialList.map((item, index) => (
                    <MaterialCardItem 
                        key={index} 
                        item={item} 
                        studyTypeContent={studyTypeContent}
                        course={course}
                        refreshData={GetStudyMaterial}
                    />
                ))}
            </div>
        </div>
    );
}

export default StudyMaterialSection