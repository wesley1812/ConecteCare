import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {Layout} from '../components/Layout';
import type { TeleconsultaData } from '../types/interfaces';



const Teleconsulta = () => {
  const { consultaId } = useParams<{ consultaId: string }>();
  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null); 

  useEffect(() => {
    
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erro ao acessar câmera/microfone:", err);
      }
    };

    startWebcam();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };

  }, [consultaId]);

  if (!teleconsulta) {
    return (
      <Layout>
        <div className="text-center py-12">Carregando informações da teleconsulta...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Teleconsulta de {teleconsulta.patientName}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[70vh]">
          {/* Tela de Vídeo */}
          <div className="flex-1 bg-gray-800 rounded-lg shadow-xl relative overflow-hidden">
            {/*  integra a biblioteca de vídeo */}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg"></video>
            <div className="absolute bottom-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded-md">
              <p>Você está conectado!</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Teleconsulta;