import { useStore } from "../store";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Studio() {
  const scriptLine = useStore((state) => state.scriptLine);
  const setScriptText = useStore((state) => state.setScriptText);
  const setVideoUrl = useStore((state) => state.setVideoUrl);
  const navigate = useNavigate();

  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const silenceDelayRef = useRef(5);
  const [silenceDelay, setSilenceDelay] = useState(3);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [partnerGender, setPartnerGender] = useState<"male" | "female">("female");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const characters = Array.from(new Set(scriptLine.map(line => line.split(/\s+/)[0])));

  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/^[A-Z]+\s+/, '')
      .replace(/\(.*?\)/g, '')
      .trim();
  };

  const getSelectedVoice = () => {
    const filters = partnerGender === "female"
      ? ["Samantha", "Victoria", "Karen", "Female"]
      : ["Daniel", "Alex", "David", "Male"];
    return voices.find(v => filters.some(f => v.name.includes(f))) || voices[0];
  };

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = updateVoices;
    updateVoices();
  }, []);
  
  useEffect(() => {
    silenceDelayRef.current = silenceDelay;
    }, [silenceDelay]);

  useEffect(() => {
    if (currentLineIndex < 0 || currentLineIndex >= scriptLine.length) return;

    const line = scriptLine[currentLineIndex];
    const isUserLine = selectedCharacter && line.startsWith(selectedCharacter);

    const element = document.getElementById(`line-${currentLineIndex}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (isUserLine) {
      timerRef.current = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
      }, silenceDelayRef.current * 1000);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(line));
      utterance.voice = getSelectedVoice();
      utterance.rate = 0.8;
      utterance.onend = () => {
        setCurrentLineIndex(prev => prev + 1);
      };
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentLineIndex, scriptLine, selectedCharacter, silenceDelay, voices]);



  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log("Camera error:", error);
      }
    };
    startCamera();
  }, []);

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      navigate("/review");
    };
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetScene = () => {
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentLineIndex(-1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-6xl mx-auto mt-8 flex flex-col md:flex-row gap-8 px-4 items-start bg-neutral-900 ">
      <div className="w-full md:w-5/12 sticky top-4 z-10 ">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-2xl shadow-2xl bg-black aspect-video object-cover border border-neutral-700"
        />
        <div className="mt-6 flex flex-col gap-3 w-full">
          <div className="flex gap-2">
            {isRecording ? (
              <button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full shadow-lg animate-pulse">
                Stop Recording
              </button>
            ) : (
              <button onClick={startRecording} className="flex-1  bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-full shadow-lg">
                Start Recording
              </button>
            )}
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setScriptText("");
                navigate("/");
              }}
              className="bg-neutral-700 hover:bg-neutral-600 text-white py-3 px-6 rounded-full text-sm font-bold"
            >
              New Script
            </button>
          </div>

          <div className="p-4 bg-neutral-800 rounded-2xl border border-neutral-700 shadow-inner">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Partner Voice</span>
              <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-700">
                <button
                  onClick={() => setPartnerGender("male")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${partnerGender === "male" ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-500"}`}
                >
                  ♂️ Male
                </button>
                <button
                  onClick={() => setPartnerGender("female")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${partnerGender === "female" ? "bg-neutral-700 text-white shadow-sm" : "text-neutral-500"}`}
                >
                  ♀️ Female
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Silence Delay</span>
              <span className="text-greem-400 font-mono">{silenceDelay}s</span>
            </div>
            <input
              type="range" min="1" max="10" step="1"
              value={silenceDelay}
              onChange={(e) => setSilenceDelay(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-green-400"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setCurrentLineIndex(0)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-full text-sm shadow-lg">
                🎬 Start Scene
              </button>
              <button onClick={resetScene} className="px-6 bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-2 rounded-full text-sm shadow-lg">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-7/12 p-8 bg-neutral-800 rounded-xl mb-20">
        <h3 className="text-xl font-bold mb-4 text-white">Your Script:</h3>
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="text-neutral-400 self-center mr-2 text-xs uppercase font-bold">Role:</span>
          {characters.map((char) => (
            <button
              key={char}
              onClick={() => setSelectedCharacter(char)}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition-all ${selectedCharacter === char ? "bg-green-400 text-black shadow-lg" : "bg-neutral-700 text-neutral-300"}`}
            >
              {char}
            </button>
          ))}
          {selectedCharacter && (
            <button onClick={() => setSelectedCharacter(null)} className="text-xs text-neutral-500 underline ml-2">Clear</button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {scriptLine?.map((line, index) => {
            const isSelected = selectedCharacter && line.startsWith(selectedCharacter);
            const isActive = index === currentLineIndex;
            return (
              <p
                key={index}
                id={`line-${index}`}
                className={`transition-all duration-300 whitespace-pre-wrap p-2 rounded-lg ${isActive ? "ring-2 ring-greem-400 bg-green-400/10 text-white shadow-lg scale-[1.01]" : isSelected ? "bg-green-400/5 text-white border-l-4 border-greem-400 font-medium" : selectedCharacter ? "opacity-30 text-neutral-500" : "text-neutral-300"}`}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}