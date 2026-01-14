import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <LoadingSpinner title="AIcademy" message="Loading resources..." />
        </div>
    );
}
