import { useEffect, useRef, useState, type JSX } from 'react';
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
    
    const shoulderDistance = Math.sqrt(
      Math.pow(leftShoulder.x - rightShoulder.x, 2) + 
      Math.pow(leftShoulder.y - rightShoulder.y, 2)
    );

    const noseVerticalPosition = nose.y;

    console.log('📊 Métricas:', {
      shoulderDistance: shoulderDistance.toFixed(3),
      noseVertical: noseVerticalPosition.toFixed(3)
    });

    if (shoulderDistance < 0.15) {
      return {
        message: "⚠️ Muito longe! Aproxime-se para melhor enquadramento.",
        status: 'warning'
      };
    } else if (shoulderDistance > 0.4) {
      return {
        message: "✅ Posição Ideal! Postura correta e bem enquadrada.",
        status: 'ideal'
      };
    } else if (noseVerticalPosition < 0.2 || noseVerticalPosition > 0.8) {
      return {
        message: "📏 Ajuste a altura: mantenha o rosto mais centralizado.",
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

// Componente para exibir o painel de feedback
const FeedbackPanel = ({ feedback }: { feedback: PostureFeedback }) => {
  let bgColor, borderColor, icon, statusText, ariaLabel;
 
  switch (feedback.status) {
    case 'ideal':
      bgColor = 'bg-green-50';
      borderColor = 'border-green-500';
      icon = '✅';
      statusText = 'Posição Ideal';
      ariaLabel = 'Posição ideal detectada';
      break;
    case 'warning':
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-500';
      icon = '⚠️';
      statusText = 'Ajuste Necessário';
      ariaLabel = 'Ajuste de posição necessário';
      break;
    case 'error':
      bgColor = 'bg-red-50';
      borderColor = 'border-red-500';
      icon = '❌';
      statusText = 'Erro no Sistema';
      ariaLabel = 'Erro no sistema de detecção';
      break;
    case 'loading':
    default:
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-500';
      icon = '🔄';
      statusText = 'Analisando';
      ariaLabel = 'Sistema analisando postura';
      break;
  }

  return (
    <div 
      className={`p-6 rounded-2xl shadow-lg border-l-4 ${bgColor} ${borderColor} h-full space-y-4 transition-all duration-300`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Monitor de Postura</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          feedback.status === 'ideal' ? 'bg-green-100 text-green-800' :
          feedback.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          feedback.status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {statusText}
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Orientações em Tempo Real
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Ajuste sua posição na câmera para garantir a melhor visibilidade durante a teleconsulta.
        </p>
      </div>
     
      <div 
        className={`p-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 ${
          feedback.status === 'ideal' ? 'bg-green-100 border-green-400 text-green-900 shadow-sm' : 
          feedback.status === 'warning' ? 'bg-yellow-100 border-yellow-400 text-yellow-900 shadow-sm' :
          feedback.status === 'error' ? 'bg-red-100 border-red-400 text-red-900 shadow-sm' :
          'bg-white border-blue-300 text-gray-700'
        }`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0" aria-hidden="true">{icon}</span>
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <span className="text-blue-500">📊</span>
          Sistema de monitoramento contínuo ativo
        </p>
      </div>
    </div>
  );
};

// Componente de Status do Sistema
const SystemStatus = ({ 
  mediaPipeStatus, 
  detectionActive, 
  cameraError,
  onRestart 
}: { 
  mediaPipeStatus: string;
  detectionActive: boolean;
  cameraError: string | null;
  onRestart: () => void;
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <span className="text-xl">⚙️</span>
        Status do Sistema
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Inteligência Artificial</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            mediaPipeStatus === 'ready' ? 'bg-green-100 text-green-800' :
            mediaPipeStatus === 'loading' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {mediaPipeStatus === 'ready' ? '✅ Ativa' :
             mediaPipeStatus === 'loading' ? '🔄 Inicializando' : '❌ Inativa'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Detecção de Postura</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            detectionActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {detectionActive ? '✅ Ativa' : '⏸️ Pausada'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Modo de Operação</span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            🎯 IMAGE Mode
          </span>
        </div>
      </div>

      {cameraError && (
        <div 
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-red-700 font-medium flex items-center gap-2">
            <span>❌</span>
            {cameraError}
          </p>
        </div>
      )}

      <button 
        onClick={onRestart}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2"
        aria-label="Reiniciar sistema de câmera e detecção"
      >
        <span className="text-lg">🔄</span>
        Reiniciar Sistema
      </button>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 Dica: Mantenha boa iluminação e posicione-se centralizado
        </p>
      </div>
    </div>
  );
};

// =========================================================================================
// 4. COMPONENTE PRINCIPAL - SOLUÇÃO IMAGE MODE
// =========================================================================================

export function Teleconsulta(): JSX.Element {
  const [feedback, setFeedback] = useState<PostureFeedback>({ 
    message: "Iniciando sistema...",
    status: 'loading' 
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mediaPipeStatus, setMediaPipeStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const detectionActiveRef = useRef(false);
  const mediaPipeReadyRef = useRef(false);

  // =========================================================================================
  // INICIALIZAÇÃO COM IMAGE MODE
  // =========================================================================================

  useEffect(() => {
    let mediaPipeInitialized = false;

    const initMediaPipe = async () => {
      if (mediaPipeInitialized) return;
      mediaPipeInitialized = true;

      try {
        setMediaPipeStatus('loading');
        console.log('🚀 Inicializando MediaPipe (IMAGE mode)...');
        
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "IMAGE",
          numPoses: 1
        });

        console.log('🎯 MediaPipe carregado (IMAGE mode)!');
        setMediaPipeStatus('ready');
        mediaPipeReadyRef.current = true;
      } catch (error) {
        console.error('❌ MediaPipe falhou:', error);
        setMediaPipeStatus('error');
      }
    };

    const initCamera = async () => {
      try {
        console.log('📷 Iniciando câmera...');
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
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
          
          if (canvasRef.current) {
            canvasRef.current.width = 640;
            canvasRef.current.height = 480;
          }

          const checkVideoReady = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              console.log('✅ Vídeo pronto!');
              setCameraError(null);
              startDetection();
            } else {
              setTimeout(checkVideoReady, 100);
            }
          };
          
          checkVideoReady();
        }
      } catch (err) {
        console.error("❌ Erro na câmera:", err);
        const errorMessage = "Câmera não acessível. Verifique as permissões do navegador.";
        setFeedback({ message: errorMessage, status: 'error' });
        setCameraError(errorMessage);
      }
    };

    const startDetection = () => {
      if (detectionActiveRef.current) return;
      detectionActiveRef.current = true;

      console.log('🎯 Iniciando detecção (IMAGE mode)...');

      const detectFrame = async () => {
        if (!detectionActiveRef.current) return;

        try {
          if (poseLandmarkerRef.current && mediaPipeReadyRef.current && videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              console.log('🔍 Detectando pose...');
              
              const result = poseLandmarkerRef.current.detect(canvas);
              
              if (result.landmarks && result.landmarks.length > 0) {
                console.log('👤 Pessoa detectada! Landmarks:', result.landmarks[0].length);
                const newFeedback = analyzePostureFromLandmarks(result.landmarks[0]);
                setFeedback(newFeedback);
              } else {
                console.log('❌ Nenhum landmark detectado');
                setFeedback({
                  message: "👤 Posicione-se frente à câmera para análise",
                  status: 'warning'
                });
              }
            }
          } else {
            console.log('⏳ Aguardando inicialização...');
            if (!mediaPipeReadyRef.current) {
              setFeedback({
                message: "🔄 Inicializando sistema de detecção...",
                status: 'loading'
              });
            }
          }
        } catch (error) {
          console.error('💥 Erro na detecção:', error);
          setFeedback({
            message: "⚠️ Sistema temporariamente indisponível",
            status: 'warning'
          });
        }

        if (detectionActiveRef.current) {
          requestAnimationFrame(detectFrame);
        }
      };

      requestAnimationFrame(detectFrame);
    };

    initMediaPipe();
    
    setTimeout(() => {
      initCamera();
    }, 500);

    return () => {
      console.log('🧹 Fazendo cleanup...');
      detectionActiveRef.current = false;
      mediaPipeReadyRef.current = false;
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const restartCamera = async () => {
    setCameraError(null);
    setFeedback({ message: "Reiniciando câmera...", status: 'loading' });
    window.location.reload();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8 space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Assistente de Postura para Teleconsulta
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Sistema inteligente que ajuda a manter a posição correta durante sua consulta médica online
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Área da Câmera */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="relative aspect-video bg-gray-900 rounded-t-3xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                    aria-label="Visualização da câmera para monitoramento de postura"
                  />

                  <canvas 
                    ref={canvasRef} 
                    className="hidden"
                    width="640" 
                    height="480"
                  />

                  {cameraError && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6">
                      <div className="bg-white rounded-2xl p-8 text-center max-w-md space-y-4">
                        <div className="text-red-500 text-4xl" aria-hidden="true">❌</div>
                        <p className="font-semibold text-red-600 text-lg">{cameraError}</p>
                        <button 
                          onClick={restartCamera}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          🔄 Tentar Novamente
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Overlay de Status */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg font-medium text-sm backdrop-blur-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-green-400">●</span>
                        Câmera {cameraError ? 'Inativa' : 'Ativa'}
                      </span>
                    </div>
                    <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg font-medium text-sm backdrop-blur-sm">
                      <span className="flex items-center gap-2">
                        <span className={
                          mediaPipeStatus === 'ready' ? 'text-green-400' :
                          mediaPipeStatus === 'loading' ? 'text-yellow-400' : 'text-red-400'
                        }>●</span>
                        IA: {mediaPipeStatus === 'ready' ? 'Ativa' : 
                             mediaPipeStatus === 'loading' ? 'Carregando' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-500">📹</span>
                    Sua Visualização
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta é a visão que o médico terá durante a consulta. Ajuste sua posição conforme as orientações.
                  </p>
                </div>
              </div>
            </div>

            {/* Painel de Orientações e Status */}
            <div className="space-y-6">
              <FeedbackPanel feedback={feedback} />
              
              <SystemStatus 
                mediaPipeStatus={mediaPipeStatus}
                detectionActive={detectionActiveRef.current}
                cameraError={cameraError}
                onRestart={restartCamera}
              />
            </div>
          </div>

          {/* Rodapé Informativo */}
          <footer className="mt-12 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <span className="text-purple-500">💡</span>
                Dicas para uma Teleconsulta de Qualidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-green-500">✓</span>
                  Ambiente bem iluminado
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-green-500">✓</span>
                  Fundo neutro e organizado
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-green-500">✓</span>
                  Conexão estável com a internet
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Layout>
  );
}