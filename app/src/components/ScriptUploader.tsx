import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function Uploader() {

  const navigate = useNavigate();

  const setScriptText = useStore((state) => state.setScriptText);
  const fileSelectHandler = async ( event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target.files?.[0];

    if(!file){
      console.log("Please upload a .txt or .pdf file")

    } else if( file.type === "text/plain"){
      const reader = new FileReader();
      reader.onload = (e) => {
        setScriptText(e.target?.result as string)
        navigate("/studio");}
        
      reader.readAsText(file);
      console.log("Sucess! File uploaded.");
      console.log("Name:", file.name);
      console.log("Size:", file.size);
    
    } else if( file.type === "application/pdf" ){
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data:arrayBuffer, isEvalSupported: false }).promise;
     
      let fullText = "";

      for(let i = 1; i <= pdf.numPages; i++ ){
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + " ";
      }
    
      setScriptText(fullText)
      navigate("/studio");
      console.log("Sucess! File uploaded.");
      console.log("Name:", file.name);
      console.log("Size:", file.size);
    };
  };
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
      <label className="flex flex-col items-center justify-center w-full max-w-xl h-64 border-2 border-dashed border-neutral-600 rounded-2xl bg-neutral-800 hover:bg-neutral-700 hover:border-neutral-400 transition-all cursor-pointer">
        <h3 className="text-lg font-semibold tracking-wide">Upload File</h3>
        <p className="text-sm text-neutral-500 mt-2">.pdf or .txt</p>
        <input className="hidden" type="file" accept=".pdf, .txt" onChange={fileSelectHandler} />
      </label>
    </div>
  )
}
