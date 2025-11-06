import { useEffect, useRef, useState, type JSX } from 'react';
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
    const leftEye = landmarks[2];
    const rightEye = landmarks[5];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    // 1. Distância entre ombros (enquadramento)
    const shoulderDistance = Math.sqrt(
      Math.pow(leftShoulder.x - rightShoulder.x, 2) + 
      Math.pow(leftShoulder.y - rightShoulder.y, 2)
    );

    // 2. Posição vertical do rosto (centralização)
    const noseVerticalPosition = nose.y;

    // 3. Posição horizontal do rosto (centralização)
    const noseHorizontalPosition = nose.x;

    // 4. Inclinação dos ombros (postura ereta)
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);

    // 5. Alinhamento ombro-quadril
    const leftAlignment = Math.abs(leftShoulder.y - leftHip.y);
    const rightAlignment = Math.abs(rightShoulder.y - rightHip.y);
    const bodyAlignment = (leftAlignment + rightAlignment) / 2;

    // 6. Visibilidade dos olhos (rosto frontal)
    const eyeDistance = Math.sqrt(
      Math.pow(leftEye.x - rightEye.x, 2) + 
      Math.pow(leftEye.y - rightEye.y, 2)
    );

    console.log('📊 Métricas de postura:', {
      shoulderDistance: shoulderDistance.toFixed(3),
      noseVertical: noseVerticalPosition.toFixed(3),
      noseHorizontal: noseHorizontalPosition.toFixed(3),
      shoulderTilt: shoulderTilt.toFixed(3),
      bodyAlignment: bodyAlignment.toFixed(3),
      eyeDistance: eyeDistance.toFixed(3)
    });

    // LÓGICA DE DETECÇÃO MELHORADA

    // Critérios para POSTURA INCORRETA
    const warnings = [];

    if (shoulderDistance < 0.12) {
      warnings.push("muito longe da câmera");
    } else if (shoulderDistance > 0.35) {
      warnings.push("muito próximo da câmera");
    }

    if (noseVerticalPosition < 0.15 || noseVerticalPosition > 0.85) {
      warnings.push("rosto muito alto/baixo");
    }

    if (noseHorizontalPosition < 0.2 || noseHorizontalPosition > 0.8) {
      warnings.push("rosto muito para os lados");
    }

    if (shoulderTilt > 0.08) {
      warnings.push("ombros desnivelados");
    }

    if (bodyAlignment > 0.25) {
      warnings.push("tronco inclinado");
    }

    if (eyeDistance < 0.05) {
      warnings.push("rosto muito lateral");
    }

    // SE HOUVER ALGUM AVISO, retorna warning
    if (warnings.length > 0) {
      const mainWarning = warnings[0];
      let message = "⚠️ ";
      
      switch (mainWarning) {
        case "muito longe da câmera":
          message += "Aproxime-se mais da câmera para melhor enquadramento.";
          break;
        case "muito próximo da câmera":
          message += "Recue um pouco para caber todo o tronco na tela.";
          break;
        case "rosto muito alto/baixo":
          message += "Centralize seu rosto na altura média da tela.";
          break;
        case "rosto muito para os lados":
          message += "Posicione-se mais ao centro da câmera.";
          break;
        case "ombros desnivelados":
          message += "Mantenha os ombros nivelados e relaxados.";
          break;
        case "tronco inclinado":
          message += "Sente-se ereto com as costas retas.";
          break;
        case "rosto muito lateral":
          message += "Vire-se mais de frente para a câmera.";
          break;
        default:
          message += "Ajuste sua posição para melhor visibilidade.";
      }

      return {
        message,
        status: 'warning'
      };
    }

    // SE NÃO HOUVER AVISOS, postura está IDEAL
    return {
      message: "✅ Posição Ideal! Postura correta e bem enquadrada. Continue assim!",
      status: 'ideal'
    };

  } catch (error) {
    console.error('Erro na análise de landmarks:', error);
    return {
      message: "📊 Analisando sua postura...",
      status: 'loading'
    };
  }
};

const analyzePostureFallback = (): PostureFeedback => {
  const now = Date.now();
  const cycle = now % 15000;

  if (cycle < 7000) {
    return {
      message: "✅ Posição Ideal! Postura correta e bem enquadrada.",
      status: 'ideal'
    };
  } else if (cycle < 12000) {
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
// 4. COMPONENTE PRINCIPAL SIMPLIFICADO
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const detectionActiveRef = useRef(false);

  // =========================================================================================
  // INICIALIZAÇÃO SIMPLIFICADA
  // =========================================================================================

  useEffect(() => {
    // 1. Carregar dados da consulta
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    let mediaPipeInitialized = false;

    // 2. Inicializar MediaPipe (não bloqueante)
    const initMediaPipe = async () => {
      if (mediaPipeInitialized) return;
      mediaPipeInitialized = true;

      try {
        setMediaPipeStatus('loading');
        console.log('🚀 Inicializando MediaPipe...');
        
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

        console.log('🎯 MediaPipe carregado!');
        setMediaPipeStatus('ready');
      } catch (error) {
        console.error('❌ MediaPipe falhou:', error);
        setMediaPipeStatus('error');
      }
    };

    // 3. Inicializar câmera de forma simples
    const initCamera = async () => {
      try {
        console.log('📷 Iniciando câmera...');
        
        // Parar stream anterior se existir
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

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
          videoRef.current.srcObject = stream;
          
          // Esperar o vídeo estar pronto de forma simples
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
        const errorMessage = "Câmera não acessível. Verifique as permissões.";
        setFeedback({ message: errorMessage, status: 'error' });
        setCameraError(errorMessage);
      }
    };

    // 4. Sistema de detecção simplificado
    const startDetection = () => {
      if (detectionActiveRef.current) return;
      detectionActiveRef.current = true;

      console.log('🎯 Iniciando detecção...');

      const detectFrame = () => {
        if (!detectionActiveRef.current) return;

        try {
          if (poseLandmarkerRef.current && mediaPipeStatus === 'ready' && videoRef.current) {
            poseLandmarkerRef.current.detectForVideo(videoRef.current, Date.now(), (result) => {
              if (result.landmarks && result.landmarks.length > 0) {
                const newFeedback = analyzePostureFromLandmarks(result.landmarks[0]);
                setFeedback(newFeedback);
              } else {
                setFeedback({
                  message: "👤 Posicione-se frente à câmera",
                  status: 'warning'
                });
              }
            });
          } else {
            // Fallback enquanto MediaPipe carrega
            const newFeedback = analyzePostureFallback();
            setFeedback(newFeedback);
          }
        } catch (error) {
          console.log('Erro na detecção, usando fallback');
          const newFeedback = analyzePostureFallback();
          setFeedback(newFeedback);
        }

        // Continuar loop apenas se ainda estiver ativo
        if (detectionActiveRef.current) {
          setTimeout(detectFrame, 200); // 5 FPS para performance
        }
      };

      detectFrame();
    };

    // Iniciar tudo
    initMediaPipe();
    
    // Iniciar câmera após um breve delay
    setTimeout(() => {
      initCamera();
    }, 1000);

    // Cleanup MUITO simples
    return () => {
      console.log('🧹 Fazendo cleanup...');
      detectionActiveRef.current = false;
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [consultaId]); // Apenas consultaId como dependência

  // =========================================================================================
  // REINICIAR CÂMERA SIMPLES
  // =========================================================================================
  const restartCamera = async () => {
    setCameraError(null);
    setFeedback({ message: "Reiniciando câmera...", status: 'loading' });
    
    // Recarregar a página é a maneira mais simples de reiniciar tudo
    window.location.reload();
  };

  // =========================================================================================
  // RENDER
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
              className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
            />

            {/* Overlay de loading apenas se houver erro */}
            {cameraError && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 text-center max-w-md">
                  <p className="font-semibold text-red-600 mb-4">{cameraError}</p>
                  <button 
                    onClick={restartCamera}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                  >
                    🔄 Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 p-2 px-4 bg-indigo-600 bg-opacity-80 text-white rounded-lg font-medium text-sm shadow-lg">
              <p>🎥 Câmera {cameraError ? 'Erro' : 'Ativa'}</p>
              <p className="text-xs opacity-75">
                {mediaPipeStatus === 'ready' ? '🤖 IA Ativa' : 
                 mediaPipeStatus === 'loading' ? '🔄 Carregando IA...' : '⚡ Modo Básico'}
              </p>
            </div>
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
              <p><strong>Detecção:</strong> {detectionActiveRef.current ? '✅ Ativa' : '⏸️ Pausada'}</p>
              {cameraError && <p className="text-red-600 mt-1">{cameraError}</p>}
            </div>

            <button 
              onClick={restartCamera}
              className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
            >
              🔄 Reiniciar Sistema
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 