import { useEffect, useRef, useState, type JSX, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { TeleconsultaData } from '../types/interfaces';
import { Layout } from '../components/Layout';

// =========================================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO DO MEDIAPIPE
// =========================================================================================

// Tipos de Feedback para o usuário
type PostureFeedback = {
  message: string;
  status: 'ideal' | 'warning' | 'error' | 'loading';
};

// =========================================================================================
// 2. LÓGICA DE ANÁLISE DE POSTURA (SIMULADA)
// =========================================================================================

/**
 * Simula a lógica de análise de postura baseada em coordenadas de landmarks.
 */
const analyzePosture = (_landmarks: any): PostureFeedback => {
    // --- Lógica de detecção de postura (simulação por tempo) ---
   
    const now = new Date().getTime();
    if (now % 20000 < 5000) {
        return {
            message: "✅ Posição Ideal! Rosto e tronco bem enquadrados.",
            status: 'ideal'
        };
    } else if (now % 20000 < 10000) {
        return {
            message: "⚠️ Por favor, afaste-se um pouco mais para enquadrar o corpo superior.",
            status: 'warning'
        };
    } else if (now % 20000 < 15000) {
        return {
            message: "❌ Postura Inadequada. Mantenha os ombros visíveis e evite inclinar-se.",
            status: 'error'
        };
    } else {
        return {
            message: "Aguardando detecção de postura...",
            status: 'loading'
        };
    }
};

// Componente para exibir o painel de feedback
const FeedbackPanel = ({ feedback, patientName }: { feedback: PostureFeedback, patientName: string }) => {
    let bgColor, borderColor, icon;
   
    switch (feedback.status) {
        case 'ideal':
            bgColor = 'bg-green-50';
            borderColor = 'border-green-500';
            icon = '✅';
            break;
        case 'warning':
            bgColor = 'bg-yellow-50';
            borderColor = 'border-yellow-500';
            icon = '⚠️';
            break;
        case 'error':
            bgColor = 'bg-red-50';
            borderColor = 'border-red-500';
            icon = '❌';
            break;
        case 'loading':
        default:
            bgColor = 'bg-blue-50';
            borderColor = 'border-blue-500';
            icon = '🔄';
            break;
    }

    return (
        <div className={`p-6 rounded-xl shadow-xl border-l-4 ${bgColor} ${borderColor} h-full space-y-4`}>
            <h3 className="text-xl font-bold text-gray-800">Orientações de Postura</h3>
            <p className="text-sm text-gray-600">
                Ajuste sua posição na câmera, {patientName}, para garantir que o médico tenha a melhor visibilidade durante a consulta.
            </p>
           
            <div className={`p-4 rounded-lg font-semibold text-lg border ${feedback.status === 'ideal' ? 'bg-green-100 border-green-600 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}>
                {icon} {feedback.message}
            </div>

            <p className="text-xs text-gray-500 pt-2">O sistema monitora em tempo real a posição do seu corpo e rosto.</p>
        </div>
    );
};

// =========================================================================================
// 3. COMPONENTE PRINCIPAL
// =========================================================================================

export function Teleconsulta(): JSX.Element {
  const { consultaId } = useParams<{ consultaId: string }>();
  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const [feedback, setFeedback] = useState<PostureFeedback>({ message: "Iniciando câmera...", status: 'loading' });
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  const analysisIntervalRef = useRef<number>(1000); // Analisar a cada 1 segundo

  /**
   * Função de loop para detecção de postura com throttling
   */
  const detectPosture = useCallback((timestamp: number) => {
    if (!videoRef.current || !teleconsulta) {
      animationFrameRef.current = requestAnimationFrame(detectPosture);
      return;
    }

    // Throttling: só analisa a cada X milissegundos
    if (timestamp - lastAnalysisTimeRef.current > analysisIntervalRef.current) {
      lastAnalysisTimeRef.current = timestamp;
      
      // --- Simulação da lógica de análise ---
      const newFeedback = analyzePosture(null);
      setFeedback(newFeedback);
    }

    // Continua o loop no próximo frame
    animationFrameRef.current = requestAnimationFrame(detectPosture);
  }, [teleconsulta]);

  // Inicializar câmera
  const startWebcam = useCallback(async () => {
    try {
      // Para evitar memory leaks, para a stream existente se houver
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Espera o vídeo estar pronto antes de iniciar a detecção
        videoRef.current.onloadedmetadata = () => {
          setCameraError(null);
          // Inicia o loop de detecção apenas quando o vídeo estiver pronto
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          animationFrameRef.current = requestAnimationFrame(detectPosture);
        };
      }
    } catch (err) {
      console.error("Erro ao acessar câmera/microfone:", err);
      const errorMessage = "❌ Erro: Não foi possível acessar câmera ou microfone.";
      setFeedback({
        message: errorMessage,
        status: 'error'
      });
      setCameraError(errorMessage);
    }
  }, [detectPosture]);

  useEffect(() => {
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    // Inicia a câmera
    startWebcam();

    // Cleanup completo
    return () => {
      // Cancela o animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Para todas as tracks da stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Limpa as referências do vídeo
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [consultaId, startWebcam]);

  // Função para reiniciar a câmera
  const restartCamera = () => {
    setFeedback({ message: "Reiniciando câmera...", status: 'loading' });
    setCameraError(null);
    startWebcam();
  };

  if (!teleconsulta) {
    return (
      <Layout>
        <div className="text-center py-12">Carregando informações da teleconsulta...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-indigo-800 text-center mb-8 border-b pb-4">
              Teleconsulta: {teleconsulta.patientName} ({teleconsulta.patientAge} anos)
            </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[70vh]">
         
          {/* COLUNA 1: Tela de Vídeo */}
          <div className="lg:flex-2 flex-1 bg-gray-800 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Tag de Vídeo (Recebe o stream da webcam) */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
            ></video>
           
            {/* Canvas Oculto (Usado pelo MediaPipe para processamento) */}
            <canvas ref={canvasRef} className="hidden"></canvas>

            {/* Overlay com informação básica */}
            <div className="absolute bottom-4 left-4 p-2 px-4 bg-indigo-600 bg-opacity-80 text-white rounded-lg font-medium text-sm shadow-lg">
              <p>Sua Câmera Ativa</p>
            </div>
           
            {/* Feedback flutuante em caso de erro/loading */}
            {(feedback.status === 'error' || feedback.status === 'loading' || cameraError) && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-black bg-opacity-70 text-white rounded-lg text-center shadow-2xl">
                    <p className="font-semibold mb-2">{cameraError || feedback.message}</p>
                    {cameraError && (
                      <button 
                        onClick={restartCamera}
                        className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        Tentar Novamente
                      </button>
                    )}
                </div>
            )}
          </div>

          {/* COLUNA 2: Painel de Feedback e Orientação */}
          <div className="lg:flex-1 w-full lg:w-1/3">
            <FeedbackPanel
                feedback={feedback}
                patientName={teleconsulta.patientName.split(' ')[0] || "paciente"}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}