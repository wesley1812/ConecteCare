import { useEffect, useRef, useState, type JSX, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { TeleconsultaData } from '../types/interfaces';
import { Layout } from '../components/Layout';
// import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

// =========================================================================================
// 1. TIPOS E CONFIGURAÇÕES
// =========================================================================================

type PostureFeedback = {
  message: string;
  status: 'ideal' | 'warning' | 'error' | 'loading';
};

// =========================================================================================
// 2. LÓGICA DE ANÁLISE DE POSTURA (SIMULADA)
// =========================================================================================

const analyzePosture = (): PostureFeedback => {
  const now = Date.now();
  const cycle = now % 20000;

  if (cycle < 5000) {
    return {
      message: "✅ Posição Ideal! Rosto e tronco bem enquadrados.",
      status: 'ideal'
    };
  } else if (cycle < 10000) {
    return {
      message: "⚠️ Por favor, afaste-se um pouco mais para enquadrar o corpo superior.",
      status: 'warning'
    };
  } else if (cycle < 15000) {
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
     
      <div className={`p-4 rounded-lg font-semibold text-lg border ${
        feedback.status === 'ideal' ? 'bg-green-100 border-green-600 text-green-800' : 
        feedback.status === 'warning' ? 'bg-yellow-100 border-yellow-600 text-yellow-800' :
        feedback.status === 'error' ? 'bg-red-100 border-red-600 text-red-800' :
        'bg-white border-gray-300 text-gray-700'
      }`}>
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
  const [feedback, setFeedback] = useState<PostureFeedback>({ 
    message: "Iniciando câmera...", 
    status: 'loading' 
  });
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  const analysisInterval = 1000; // Analisar a cada 1 segundo

  /**
   * Função de loop para detecção de postura com throttling
   */
  const detectPosture = useCallback((timestamp: number) => {
    // Throttling: só analisa a cada X milissegundos
    if (timestamp - lastAnalysisTimeRef.current > analysisInterval) {
      lastAnalysisTimeRef.current = timestamp;
      
      // Análise de postura simulada
      const newFeedback = analyzePosture();
      setFeedback(newFeedback);
    }

    // Continua o loop no próximo frame
    animationFrameRef.current = requestAnimationFrame(detectPosture);
  }, []);

  // Inicializar câmera
  const startWebcam = useCallback(async () => {
    try {
      // Cleanup da stream anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Limpar animation frame anterior
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Espera o vídeo estar pronto
        const waitForVideo = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            setCameraError(null);
            setFeedback({ 
              message: "Câmera ativa - Analisando postura...", 
              status: 'loading' 
            });
            
            // Inicia o loop de detecção
            lastAnalysisTimeRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(detectPosture);
          } else {
            setTimeout(waitForVideo, 100);
          }
        };
        
        waitForVideo();
      }
    } catch (err) {
      console.error("Erro ao acessar câmera/microfone:", err);
      const errorMessage = "❌ Não foi possível acessar a câmera. Verifique as permissões.";
      setFeedback({
        message: errorMessage,
        status: 'error'
      });
      setCameraError(errorMessage);
    }
  }, [detectPosture]);

  // Efeito principal
  useEffect(() => {
    // Carregar dados da teleconsulta
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    // Iniciar câmera
    startWebcam();

    // Cleanup completo
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
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

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto min-h-[600px]">
         
          {/* COLUNA 1: Tela de Vídeo */}
          <div className="lg:flex-2 flex-1 bg-gray-800 rounded-2xl shadow-2xl relative overflow-hidden min-h-[400px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
            />
           
            {/* Overlay com informação básica */}
            <div className="absolute bottom-4 left-4 p-2 px-4 bg-indigo-600 bg-opacity-80 text-white rounded-lg font-medium text-sm shadow-lg">
              <p>Sua Câmera Ativa</p>
            </div>
           
            {/* Feedback flutuante em caso de erro */}
            {cameraError && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 text-center max-w-md">
                  <p className="font-semibold text-red-600 mb-4">{cameraError}</p>
                  <button 
                    onClick={restartCamera}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Tentar Novamente
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Certifique-se de que a câmera não está sendo usada por outro aplicativo
                  </p>
                </div>
              </div>
            )}

            {/* Indicador de loading quando não há erro mas ainda está carregando */}
            {!cameraError && feedback.status === 'loading' && (
              <div className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg text-sm">
                🔄 Analisando...
              </div>
            )}
          </div>

          {/* COLUNA 2: Painel de Feedback e Orientação */}
          <div className="lg:flex-1 w-full lg:w-1/3">
            <FeedbackPanel
              feedback={feedback}
              patientName={teleconsulta.patientName.split(' ')[0] || "paciente"}
            />
            
            {/* Botão de ações */}
            <div className="mt-4 flex gap-2">
              <button 
                onClick={restartCamera}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              >
                🔄 Reiniciar Câmera
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}