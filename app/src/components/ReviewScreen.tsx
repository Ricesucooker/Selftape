import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Review() {

    const videoUrl = useStore((state) => state.videoUrl);
    const setVideoUrl = useStore((state) => state.setVideoUrl);
    const navigate = useNavigate();

    const handleRetake = () => {
    setVideoUrl(null);
    navigate("/studio");
    };

    if (!videoUrl) {
    return <div className="text-white text-center mt-20 text-xl">No video found! Go back and record a take.</div>;
    }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center pt-12 px-4">
      <h2 className="text-3xl font-bold text-white mb-8">Review Your Take</h2>

      <video 
        src={videoUrl} 
        controls 
        className="w-full max-w-4xl rounded-2xl shadow-2xl bg-black aspect-video" 
      />
      
      
      <div className="flex gap-6 mt-10">
        <button 
          onClick={handleRetake} 
          className="px-8 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-full transition-all"
        >
        🗑️ Delete & Retake
        </button>
        
        <a 
          href={videoUrl} 
          download="my-selftape-take.webm" 
          className="px-8 py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-full transition-all flex items-center"
        >
         💾 Save 
        </a>
      </div>
    </div>
  );
}
