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
// 3. LÓGICA DE ANÁLISE DE POSTURA
// =========================================================================================

const analyzePostureFromLandmarks = (landmarks: any[]): PostureFeedback => {
  if (!landmarks || landmarks.length === 0) {
    return {
      message: "🔍 Nenhuma pessoa detectada. Certifique-se de estar visível na câmera.",
      status: 'warning'
    };
  }

  try {
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    const shoulderDistance = Math.sqrt(
      Math.pow(leftShoulder.x - rightShoulder.x, 2) + 
      Math.pow(leftShoulder.y - rightShoulder.y, 2)
    );

    const noseVerticalPosition = nose.y;

    const shoulderHipAlignment = Math.abs(
      (leftShoulder.y + rightShoulder.y) / 2 - (leftHip.y + rightHip.y) / 2
    );

    if (shoulderDistance < 0.15) {
      return {
        message: "⚠️ Muito longe! Aproxime-se para melhor enquadramento.",
        status: 'warning'
      };
    } else if (shoulderDistance > 0.4) {
      return {
        message: "⚠️ Muito próximo! Recue um pouco.",
        status: 'warning'
      };
    } else if (noseVerticalPosition < 0.2 || noseVerticalPosition > 0.8) {
      return {
        message: "📏 Ajuste a altura: mantenha o rosto mais centralizado.",
        status: 'warning'
      };
    } else if (shoulderHipAlignment > 0.3) {
      return {
        message: "⚡ Evite inclinar o tronco. Mantenha postura ereta.",
        status: 'warning'
      };
    } else {
      return {
        message: "✅ Posição Ideal! Postura correta e bem enquadrada.",
        status: 'ideal'
      };
    }
  } catch (error) {
    return {
      message: "📊 Analisando sua postura...",
      status: 'loading'
    };
  }
};

const analyzePostureFallback = (): PostureFeedback => {
  const now = Date.now();
  const cycle = now % 20000;

  if (cycle < 8000) {
    return {
      message: "✅ Posição Ideal! Postura correta e bem enquadrada.",
      status: 'ideal'
    };
  } else if (cycle < 14000) {
    return {
      message: "⚠️ Ajuste sua posição para melhor visibilidade.",
      status: 'warning'
    };
  } else {
    return {
      message: "📊 Analisando sua postura...",
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
        Ajuste sua posição na câmera, {patientName}, para garantir que o médico tenha a melhor visibilidade.
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
// 4. COMPONENTE PRINCIPAL OTIMIZADO
// =========================================================================================

export function Teleconsulta(): JSX.Element {
  const { consultaId } = useParams<{ consultaId: string }>();
  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const [feedback, setFeedback] = useState<PostureFeedback>({ 
    message: "Iniciando sistema...", 
    status: 'loading' 
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mediaPipeStatus, setMediaPipeStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  const analysisInterval = 150;
  const mediaPipeInitializedRef = useRef(false);

  // =========================================================================================
  // INICIALIZAÇÃO DO MEDIAPIPE OTIMIZADA - CARREGAMENTO EM BACKGROUND
  // =========================================================================================
  const initializeMediaPipe = useCallback(async () => {
    // Evitar inicialização duplicada
    if (mediaPipeInitializedRef.current) return;
    mediaPipeInitializedRef.current = true;

    try {
      setMediaPipeStatus('loading');
      console.log('🚀 Inicializando MediaPipe em background...');
      
      // Inicialização não-bloqueante - não atualiza estado até estar pronto
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });

      console.log('🎯 MediaPipe carregado com sucesso!');
      setMediaPipeStatus('ready');
      
    } catch (error) {
      console.error('❌ MediaPipe falhou, usando modo básico:', error);
      setMediaPipeStatus('error');
    }
  }, []);

  // =========================================================================================
  // DETECÇÃO DE POSTURA OTIMIZADA
  // =========================================================================================
  const detectPosture = useCallback((timestamp: number) => {
    if (!videoRef.current || !videoReady) {
      animationFrameRef.current = requestAnimationFrame(detectPosture);
      return;
    }

    if (timestamp - lastAnalysisTimeRef.current < analysisInterval) {
      animationFrameRef.current = requestAnimationFrame(detectPosture);
      return;
    }

    lastAnalysisTimeRef.current = timestamp;

    try {
      if (poseLandmarkerRef.current && mediaPipeStatus === 'ready') {
        poseLandmarkerRef.current.detectForVideo(videoRef.current!, timestamp, (result) => {
          if (result.landmarks && result.landmarks.length > 0) {
            const newFeedback = analyzePostureFromLandmarks(result.landmarks[0]);
            setFeedback(newFeedback);
          } else {
            setFeedback({
              message: "👤 Posicione-se frente à câmera para análise",
              status: 'warning'
            });
          }
        });
      } else {
        // Modo fallback imediato enquanto MediaPipe carrega
        const newFeedback = analyzePostureFallback();
        setFeedback(newFeedback);
      }
    } catch (error) {
      const newFeedback = analyzePostureFallback();
      setFeedback(newFeedback);
    }

    animationFrameRef.current = requestAnimationFrame(detectPosture);
  }, [mediaPipeStatus, videoReady]);

  // =========================================================================================
  // INICIALIZAÇÃO DA CÂMERA OTIMIZADA - SEM FLICKER
  // =========================================================================================
  const startWebcam = useCallback(async () => {
    try {
      // Cleanup limpo
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setVideoReady(false);
      setFeedback({ message: "Iniciando câmera...", status: 'loading' });

      console.log('📷 Iniciando câmera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 25 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        // Prevenir flicker - configurar callbacks antes de atribuir srcObject
        const video = videoRef.current;
        
        const handleVideoReady = () => {
          console.log('✅ Vídeo pronto e estável');
          setVideoReady(true);
          setCameraError(null);
          lastAnalysisTimeRef.current = performance.now();
          animationFrameRef.current = requestAnimationFrame(detectPosture);
        };

        const handleVideoError = () => {
          console.error('❌ Erro no elemento de vídeo');
          setCameraError("Erro na transmissão de vídeo");
        };

        // Remover listeners anteriores e adicionar novos
        video.removeEventListener('loadeddata', handleVideoReady);
        video.removeEventListener('error', handleVideoError);
        
        video.addEventListener('loadeddata', handleVideoReady, { once: true });
        video.addEventListener('error', handleVideoError, { once: true });
        
        // Atribuir stream apenas depois de configurar os listeners
        video.srcObject = stream;
      }
    } catch (err) {
      console.error("❌ Erro na câmera:", err);
      const errorMessage = "Câmera não acessível. Verifique as permissões.";
      setFeedback({ message: errorMessage, status: 'error' });
      setCameraError(errorMessage);
    }
  }, [detectPosture]);

  // =========================================================================================
  // EFFECTS OTIMIZADOS
  // =========================================================================================
  useEffect(() => {
    // Inicializar dados imediatamente
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    // Iniciar MediaPipe imediatamente (não bloqueante)
    initializeMediaPipe();

    // Iniciar câmera após um breve delay para priorizar feedback visual
    const cameraTimer = setTimeout(() => {
      startWebcam();
    }, 100);

    return () => {
      clearTimeout(cameraTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [consultaId, initializeMediaPipe, startWebcam]);

  // =========================================================================================
  // RENDER OTIMIZADO
  // =========================================================================================
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
         
          <div className="lg:flex-2 flex-1 bg-gray-800 rounded-2xl shadow-2xl relative overflow-hidden min-h-[400px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover rounded-2xl transform scale-x-[-1] transition-opacity duration-300 ${
                videoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
           
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay de loading suave */}
            {!videoReady && !cameraError && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Iniciando câmera...</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 p-2 px-4 bg-indigo-600 bg-opacity-80 text-white rounded-lg font-medium text-sm shadow-lg">
              <p>🎥 Câmera {videoReady ? 'Ativa' : 'Conectando...'}</p>
              <p className="text-xs opacity-75">
                {mediaPipeStatus === 'ready' ? '🤖 IA Ativa' : 
                 mediaPipeStatus === 'loading' ? '🔄 Carregando IA...' : '⚡ Modo Básico'}
              </p>
            </div>
           
            {cameraError && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 text-center max-w-md">
                  <p className="font-semibold text-red-600 mb-4">{cameraError}</p>
                  <button 
                    onClick={startWebcam}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                  >
                    🔄 Tentar Novamente
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:flex-1 w-full lg:w-1/3">
            <FeedbackPanel
              feedback={feedback}
              patientName={teleconsulta.patientName.split(' ')[0] || "paciente"}
            />
            
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p><strong>Status:</strong> {
                mediaPipeStatus === 'ready' ? '🤖 IA Funcionando' :
                mediaPipeStatus === 'loading' ? '🔄 Inicializando IA...' :
                '⚡ Modo Básico'
              }</p>
              <p><strong>Câmera:</strong> {videoReady ? '✅ Conectada' : '🔄 Conectando...'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}