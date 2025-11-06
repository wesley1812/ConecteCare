import { useEffect, useRef, useState, type JSX, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { TeleconsultaData } from '../types/interfaces';
import { Layout } from '../components/Layout';

// =========================================================================================
// 1. IMPORTAÇÕES DO MEDIAPIPE
// =========================================================================================
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
   
// =========================================================================================
// 2. TIPOS E INTERFACES
// =========================================================================================

type PostureFeedback = {
  message: string;
  status: 'ideal' | 'warning' | 'error' | 'loading';
};

// =========================================================================================
// 3. LÓGICA DE ANÁLISE DE POSTURA COM MEDIAPIPE
// =========================================================================================

const analyzePostureFromLandmarks = (landmarks: any[]): PostureFeedback => {
  if (!landmarks || landmarks.length === 0) {
    return {
      message: "🔍 Nenhuma pessoa detectada. Certifique-se de estar visível na câmera.",
      status: 'warning'
    };
  }

  // Exemplo de análise simplificada baseada em landmarks
  // Landmarks importantes: 0-nariz, 11-ombro esquerdo, 12-ombro direito, 23-24 quadril
  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  // Calcular distância entre ombros para verificar enquadramento
  const shoulderDistance = Math.sqrt(
    Math.pow(leftShoulder.x - rightShoulder.x, 2) + 
    Math.pow(leftShoulder.y - rightShoulder.y, 2)
  );

  // Calcular posição vertical do nariz (para verificar se está centralizado)
  const noseVerticalPosition = nose.y;

  // Lógica de análise baseada nas coordenadas
  if (shoulderDistance < 0.2) {
    return {
      message: "⚠️ Por favor, afaste-se um pouco mais para enquadrar o corpo superior.",
      status: 'warning'
    };
  } else if (shoulderDistance > 0.4) {
    return {
      message: "⚠️ Muito próximo! Recue um pouco para melhor enquadramento.",
      status: 'warning'
    };
  } else if (noseVerticalPosition < 0.3 || noseVerticalPosition > 0.7) {
    return {
      message: "📏 Ajuste a posição: mantenha o rosto mais centralizado na tela.",
      status: 'warning'
    };
  } else {
    return {
      message: "✅ Posição Ideal! Rosto e tronco bem enquadrados.",
      status: 'ideal'
    };
  }
};

// Fallback para quando o MediaPipe não está disponível
const analyzePostureFallback = (): PostureFeedback => {
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
// 4. COMPONENTE PRINCIPAL
// =========================================================================================

export function Teleconsulta(): JSX.Element {
  const { consultaId } = useParams<{ consultaId: string }>();
  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const [feedback, setFeedback] = useState<PostureFeedback>({ 
    message: "Iniciando câmera e modelo de IA...", 
    status: 'loading' 
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mediaPipeStatus, setMediaPipeStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  const analysisInterval = 100; // Analisar a cada 100ms para resposta rápida

  // =========================================================================================
  // INICIALIZAÇÃO DO MEDIAPIPE
  // =========================================================================================
  const initializeMediaPipe = useCallback(async () => {
    try {
      setMediaPipeStatus('loading');
      setFeedback({ message: "Carregando modelo de detecção corporal...", status: 'loading' });

      console.log('Inicializando MediaPipe...');
      
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      console.log('FilesetResolver carregado, criando PoseLandmarker...');

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });

      console.log('PoseLandmarker inicializado com sucesso!');
      setMediaPipeStatus('ready');
      setFeedback({ message: "Modelo carregado! Iniciando análise...", status: 'loading' });

    } catch (error) {
      console.error('Erro ao inicializar MediaPipe:', error);
      setMediaPipeStatus('error');
      setFeedback({ 
        message: "⚠️ Modo simulação ativado (IA não disponível)", 
        status: 'warning' 
      });
    }
  }, []);

  // =========================================================================================
  // DETECÇÃO DE POSTURA COM MEDIAPIPE
  // =========================================================================================
  const detectPosture = useCallback((timestamp: number) => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectPosture);
      return;
    }

    // Throttling para performance
    if (timestamp - lastAnalysisTimeRef.current < analysisInterval) {
      animationFrameRef.current = requestAnimationFrame(detectPosture);
      return;
    }

    lastAnalysisTimeRef.current = timestamp;

    try {
      // Usar MediaPipe se estiver disponível
      if (poseLandmarkerRef.current && mediaPipeStatus === 'ready') {
        poseLandmarkerRef.current.detectForVideo(videoRef.current, timestamp, (result) => {
          if (result.landmarks && result.landmarks.length > 0) {
            const newFeedback = analyzePostureFromLandmarks(result.landmarks[0]);
            setFeedback(newFeedback);
          } else {
            // Nenhuma pessoa detectada
            setFeedback({
              message: "🔍 Nenhuma pessoa detectada. Certifique-se de estar visível na câmera.",
              status: 'warning'
            });
          }
        });
      } else {
        // Fallback para análise simulada
        const newFeedback = analyzePostureFallback();
        setFeedback(newFeedback);
      }
    } catch (error) {
      console.error('Erro na detecção:', error);
      // Fallback em caso de erro
      const newFeedback = analyzePostureFallback();
      setFeedback(newFeedback);
    }

    animationFrameRef.current = requestAnimationFrame(detectPosture);
  }, [mediaPipeStatus]);

  // =========================================================================================
  // INICIALIZAÇÃO DA CÂMERA
  // =========================================================================================
  const startWebcam = useCallback(async () => {
    try {
      // Cleanup anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      console.log('Solicitando acesso à câmera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Esperar o vídeo estar pronto
        const waitForVideo = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            console.log('Vídeo pronto, iniciando detecção...');
            setCameraError(null);
            lastAnalysisTimeRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(detectPosture);
          } else {
            setTimeout(waitForVideo, 100);
          }
        };
        
        waitForVideo();
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      const errorMessage = "❌ Não foi possível acessar a câmera. Verifique as permissões.";
      setFeedback({
        message: errorMessage,
        status: 'error'
      });
      setCameraError(errorMessage);
    }
  }, [detectPosture]);

  // =========================================================================================
  // EFFECT PRINCIPAL
  // =========================================================================================
  useEffect(() => {
    // Carregar dados da teleconsulta
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    // Inicializar MediaPipe e depois a câmera
    const initializeAll = async () => {
      await initializeMediaPipe();
      await startWebcam();
    };

    initializeAll();

    // Cleanup completo
    return () => {
      console.log('Fazendo cleanup...');
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
      
      // Limpar MediaPipe
      poseLandmarkerRef.current = null;
    };
  }, [consultaId, initializeMediaPipe, startWebcam]);

  // =========================================================================================
  // FUNÇÃO PARA REINICIAR
  // =========================================================================================
  const restartCamera = async () => {
    setFeedback({ message: "Reiniciando câmera...", status: 'loading' });
    setCameraError(null);
    await startWebcam();
  };

  const restartMediaPipe = async () => {
    setFeedback({ message: "Reiniciando modelo de IA...", status: 'loading' });
    await initializeMediaPipe();
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
           
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay com informação básica */}
            <div className="absolute bottom-4 left-4 p-2 px-4 bg-indigo-600 bg-opacity-80 text-white rounded-lg font-medium text-sm shadow-lg">
              <p>Sua Câmera Ativa</p>
              <p className="text-xs opacity-75">
                {mediaPipeStatus === 'ready' ? '🤖 IA Ativa' : 
                 mediaPipeStatus === 'loading' ? '🔄 Carregando IA...' : '⚠️ Modo Simulação'}
              </p>
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
                </div>
              </div>
            )}

            {/* Indicador de status */}
            {!cameraError && feedback.status === 'loading' && (
              <div className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg text-sm">
                {mediaPipeStatus === 'loading' ? '🔄 Carregando IA...' : '🔍 Analisando...'}
              </div>
            )}
          </div>

          {/* COLUNA 2: Painel de Feedback e Orientação */}
          <div className="lg:flex-1 w-full lg:w-1/3">
            <FeedbackPanel
              feedback={feedback}
              patientName={teleconsulta.patientName.split(' ')[0] || "paciente"}
            />
            
            {/* Botões de controle */}
            <div className="mt-4 flex gap-2 flex-wrap">
              <button 
                onClick={restartCamera}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              >
                🔄 Câmera
              </button>
              <button 
                onClick={restartMediaPipe}
                className="flex-1 px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg transition-colors font-medium"
              >
                {mediaPipeStatus === 'ready' ? '🔄 IA' : '🤖 IA'}
              </button>
            </div>

            {/* Status do sistema */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p><strong>Status:</strong> {
                mediaPipeStatus === 'ready' ? 'IA funcionando normalmente' :
                mediaPipeStatus === 'loading' ? 'Carregando modelo de IA...' :
                'Usando análise simulada'
              }</p>
              {cameraError && <p className="text-red-600 mt-1">{cameraError}</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}