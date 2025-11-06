import { useEffect, useRef, useState, type JSX } from 'react';

// =========================================================================================
// 0. COMPONENTE DE LAYOUT (SIMPLIFICADO PARA O ARQUIVO ÚNICO)
// =========================================================================================
// O componente original importava o Layout, aqui está uma versão simples
// para garantir que o código seja self-contained e funcional.
// NOTA: Os estilos globais de fonte são assumidos pelo ambiente Tailwind
import { Layout } from "../components/Layout";


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
// 3. LÓGICA DE ANÁLISE DE POSTURA (INTACTA)
// =========================================================================================

const analyzePostureFromLandmarks = (landmarks: any[]): PostureFeedback => {
  if (!landmarks || landmarks.length === 0) {
    return {
      message: "🔍 Nenhuma pessoa detectada. Certifique-se de estar visível na câmera.",
      status: 'warning'
    };
  }

  try {
    // 0: Nariz, 11: Ombro Esquerdo, 12: Ombro Direito
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    // Cálculo da distância dos ombros para enquadramento (horizontal)
    const shoulderDistance = Math.sqrt(
      Math.pow(leftShoulder.x - rightShoulder.x, 2) + 
      Math.pow(leftShoulder.y - rightShoulder.y, 2)
    );

    // Posição vertical do nariz para altura (vertical)
    const noseVerticalPosition = nose.y;

    if (shoulderDistance < 0.15) {
      return {
        message: "⚠️ Muito longe! Aproxime-se para melhor enquadramento.",
        status: 'warning'
      };
    } else if (shoulderDistance > 0.45) { // Aumentei um pouco a margem de ideal para focar mais na postura
      return {
        message: "✅ Posição Ideal! Postura correta e bem enquadrada.",
        status: 'ideal'
      };
    } else if (noseVerticalPosition < 0.2 || noseVerticalPosition > 0.6) { // Ajustei o range vertical
      return {
        message: "📏 Ajuste a altura: mantenha o rosto e o tronco centralizados no quadro (entre 20% e 60% da tela).",
        status: 'warning'
      };
    } else {
      return {
        message: "⭐ Postura Perfeita! Enquadramento e posição de tronco ideais.",
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

// =========================================================================================
// COMPONENTES DE VISUALIZAÇÃO (DESIGN REVISADO PARA O TEMA AZUL/CIANO)
// =========================================================================================

const FeedbackPanel = ({ feedback }: { feedback: PostureFeedback }) => {
  let bgColor, ringColor, icon, statusText, ariaLabel;
  
  // Cores ajustadas para o tema (blue-600 / cyan-500)
  switch (feedback.status) {
    case 'ideal':
      bgColor = 'bg-white';
      ringColor = 'ring-green-500';
      icon = '🌟';
      statusText = 'Ideal';
      ariaLabel = 'Posição ideal detectada';
      break;
    case 'warning':
      bgColor = 'bg-yellow-50';
      ringColor = 'ring-yellow-400';
      icon = '⚠️';
      statusText = 'Ajuste';
      ariaLabel = 'Ajuste de posição necessário';
      break;
    case 'error':
      bgColor = 'bg-red-50';
      ringColor = 'ring-red-500';
      icon = '🚨';
      statusText = 'Erro';
      ariaLabel = 'Erro no sistema de detecção';
      break;
    case 'loading':
    default:
      bgColor = 'bg-white';
      ringColor = 'ring-blue-400'; // Alterado para blue
      icon = '🔄';
      statusText = 'Aguardando';
      ariaLabel = 'Sistema analisando postura';
      break;
  }

  return (
    <div 
      className={`p-6 rounded-3xl shadow-2xl bg-white space-y-5 transition-all duration-500 transform border-t-8 border-cyan-500`} // Cor de destaque Cyan (Sintaxe corrigida)
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between border-b pb-3 border-gray-100">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <span className="text-3xl text-blue-600">🎯</span> {/* Cor primária Blue */}
          Feedback Rápido
        </h2>
        <span className={`px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase ${
            feedback.status === 'ideal' ? 'bg-green-600 text-white shadow-md' :
            feedback.status === 'warning' ? 'bg-yellow-400 text-gray-800 shadow-md' :
            feedback.status === 'error' ? 'bg-red-600 text-white shadow-md' :
            'bg-blue-100 text-blue-700' // Alterado para blue
          }`} // Sintaxe corrigida
        >
          {statusText}
        </span>
      </div>

      <div 
        className={`p-4 rounded-xl font-semibold text-lg ring-4 ${ringColor} ${bgColor} 
                    shadow-inner transition-all duration-300`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">{icon}</span>
          <p className="leading-snug text-gray-800">{feedback.message}</p>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-xl text-cyan-600">💡</span> {/* Cor de destaque Cyan */}
          Orientações
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          O sistema analisa a posição da sua cabeça e ombros (landmarks) para garantir que você esteja bem enquadrado e com a postura mais adequada para a avaliação.
        </p>
      </div>
    </div>
  );
};

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
    <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-gray-100">
      <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
        <span className="text-3xl text-blue-600">⚙️</span> {/* Cor primária Blue */}
        Detalhes Técnicos
      </h3>
      
      <div className="space-y-4">
        {/* IA Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-inner">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="text-cyan-500">🧠</span> {/* Cor de destaque Cyan */}
            Módulo de IA (MediaPipe)
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
            mediaPipeStatus === 'ready' ? 'bg-green-500 text-white' :
            mediaPipeStatus === 'loading' ? 'bg-blue-100 text-blue-700 animate-pulse' : // Ajustado para blue
            'bg-red-100 text-red-700'
          }`}>
            {mediaPipeStatus === 'ready' ? '✅ Carregado' :
             mediaPipeStatus === 'loading' ? '🔄 Carregando...' : '❌ Falhou'}
          </span>
        </div>

        {/* Detecção Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-inner">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="text-blue-500">👁️</span> {/* Cor primária Blue */}
            Detecção em Tempo Real
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
            detectionActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {detectionActive ? '▶️ Ativa' : '⏸️ Pausada'}
          </span>
        </div>

        {/* Modo Operação */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-inner">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="text-cyan-500">🚀</span> {/* Cor de destaque Cyan */}
            Modo de Execução
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-cyan-100 text-cyan-700"> {/* Ajustado para cyan */}
            IMAGE Mode
          </span>
        </div>
      </div>

      {cameraError && (
        <div 
          className="p-4 bg-red-100 border-2 border-red-300 rounded-xl shadow-md"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-red-800 font-semibold flex items-center gap-2">
            <span>❌ ERRO:</span>
            {cameraError}
          </p>
        </div>
      )}

      <button 
        onClick={onRestart}
        className="w-full px-4 py-4 mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-3 text-lg" // Gradiente de Blue para Cyan
        aria-label="Reiniciar sistema de câmera e detecção"
      >
        <span className="text-xl">🔄</span>
        Reiniciar Sistema
      </button>

      <div className="pt-3 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          Versão 1.0 - Monitoramento de Postura com MediaPipe Pose Landmarker
        </p>
      </div>
    </div>
  );
};


// =========================================================================================
// 4. COMPONENTE PRINCIPAL - SOLUÇÃO IMAGE MODE (ESTRUTURA REVISADA)
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
  // INICIALIZAÇÃO COM IMAGE MODE (LÓGICA INTACTA)
  // =========================================================================================

  useEffect(() => {
    let mediaPipeInitialized = false;

    const initMediaPipe = async () => {
      if (mediaPipeInitialized) return;
      mediaPipeInitialized = true;

      try {
        setMediaPipeStatus('loading');
        
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

        setMediaPipeStatus('ready');
        mediaPipeReadyRef.current = true;
      } catch (error) {
        setMediaPipeStatus('error');
      }
    };

    const initCamera = async () => {
      try {
        
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
              setCameraError(null);
              startDetection();
            } else {
              setTimeout(checkVideoReady, 100);
            }
          };
          
          checkVideoReady();
        }
      } catch (err) {
        const errorMessage = "Câmera não acessível. Verifique as permissões do navegador (código: " + (err as Error).name + ").";
        setFeedback({ message: errorMessage, status: 'error' });
        setCameraError(errorMessage);
      }
    };

    const startDetection = () => {
      if (detectionActiveRef.current) return;
      detectionActiveRef.current = true;

      let lastVideoTime = -1;
      let lastDetectionTime = 0;
      const detectionInterval = 1000 / 10; // Tentar 10 FPS de detecção

      const detectFrame = async () => {
        if (!detectionActiveRef.current) return;

        const now = performance.now();
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas && poseLandmarkerRef.current && mediaPipeReadyRef.current) {
          // Garante que o vídeo tenha avançado e que o intervalo de tempo tenha passado
          if (video.currentTime !== lastVideoTime && (now - lastDetectionTime) > detectionInterval) {
            lastVideoTime = video.currentTime;
            lastDetectionTime = now;
            
            try {
              const ctx = canvas.getContext('2d');
              if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
                // Desenha o frame no canvas (necessário para o detect IMAGE mode)
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // O detect() aceita CanvasElement (como esperado no Image mode)
                const result = poseLandmarkerRef.current.detect(canvas);
                
                if (result.landmarks && result.landmarks.length > 0) {
                  const newFeedback = analyzePostureFromLandmarks(result.landmarks[0]);
                  setFeedback(newFeedback);
                } else {
                  setFeedback({
                    message: "👤 Posicione-se frente à câmera para análise (tronco e cabeça visíveis)",
                    status: 'warning'
                  });
                }
              }
            } catch (error) {
              // Erro silencioso na detecção para não interromper a RAF
            }
          }
        } else if (!mediaPipeReadyRef.current) {
          setFeedback({
            message: "🔄 Inicializando sistema de detecção...",
            status: 'loading'
          });
        }
        
        // Continua o loop de animação
        if (detectionActiveRef.current) {
          requestAnimationFrame(detectFrame);
        }
      };

      requestAnimationFrame(detectFrame);
    };

    initMediaPipe();
    
    // Pequeno atraso para dar tempo ao MediaPipe iniciar antes da câmera
    setTimeout(() => {
      initCamera();
    }, 500);

    return () => {
      detectionActiveRef.current = false;
      mediaPipeReadyRef.current = false;
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Limpeza do PoseLandmarker
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
        poseLandmarkerRef.current = null;
      }
    };
  }, []);

  const restartCamera = async () => {
    // A maneira mais simples e robusta de reiniciar todo o sistema e tentar novamente as permissões.
    window.location.reload(); 
  };

  return (
    <Layout>
      {/* Alterado de bg-gray-50 para usar o fundo da marca (se houver, senão branco/cinza claro) */}
      <div className="min-h-screen bg-white font-sans p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-10 space-y-4">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent tracking-tight">
              Assistente de Postura | Teleconsulta
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Utilizando **Inteligência Artificial (MediaPipe)** para monitorar e guiar sua posição em tempo real, garantindo a qualidade da sua consulta online.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Área da Câmera (2/3 da tela em desktop) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-cyan-300/50"> {/* Sombra azul */}
                <div className="relative aspect-video bg-gray-900 rounded-t-3xl">
                  {/* Container da Câmera */}
                  <div className="w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1] rounded-t-3xl"
                      aria-label="Visualização da câmera para monitoramento de postura"
                    />
                  </div>

                  {/* Canvas (Oculto - usado apenas para o processamento do MediaPipe em IMAGE mode) */}
                  <canvas 
                    ref={canvasRef} 
                    className="absolute top-0 left-0 hidden"
                    width="640" 
                    height="480"
                  />

                  {/* Mensagem de Erro da Câmera */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-10">
                      <div className="bg-white rounded-2xl p-8 text-center max-w-sm space-y-4 shadow-xl border-t-4 border-red-500">
                        <div className="text-red-500 text-5xl" aria-hidden="true">🚫</div>
                        <h2 className="font-bold text-xl text-red-700">Acesso Negado à Câmera</h2>
                        <p className="font-medium text-gray-700 text-sm leading-relaxed">{cameraError}</p>
                        <button 
                          onClick={restartCamera}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          🔄 Tentar Novamente
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Overlay de Status Inferior */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3">
                    <div className="bg-black/70 text-white px-4 py-2 rounded-xl font-medium text-sm backdrop-blur-sm shadow-lg border border-white/20">
                      <span className="flex items-center gap-2">
                        <span className="text-green-400 text-lg">📹</span>
                        Câmera {cameraError ? 'Inativa' : 'Ativa'}
                      </span>
                    </div>
                    <div className="bg-black/70 text-white px-4 py-2 rounded-xl font-medium text-sm backdrop-blur-sm shadow-lg border border-white/20">
                      <span className="flex items-center gap-2">
                        <span className={
                          mediaPipeStatus === 'ready' ? 'text-green-400' :
                          mediaPipeStatus === 'loading' ? 'text-cyan-400 animate-spin' : 'text-red-400' // Ajustado para cyan
                        }>
                          {mediaPipeStatus === 'ready' ? '🧠' : mediaPipeStatus === 'loading' ? '⏳' : '❌'}
                        </span>
                        IA: {mediaPipeStatus === 'ready' ? 'Ativa' : 
                              mediaPipeStatus === 'loading' ? 'Carregando' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-50 to-white rounded-b-3xl"> {/* Gradiente suave com Blue */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-blue-600">✨</span> {/* Cor primária Blue */}
                    Sua Visualização de Teleconsulta
                  </h3>
                  <p className="text-sm text-gray-600">
                    A imagem espelhada à esquerda representa o que seu médico visualiza. A inteligência artificial trabalha em segundo plano para analisar sua postura.
                  </p>
                </div>
              </div>
            </div>

            {/* Painel de Orientações e Status (1/3 da tela em desktop) */}
            {/* <div className="space-y-8">
              <FeedbackPanel feedback={feedback} />
              
              <SystemStatus 
                mediaPipeStatus={mediaPipeStatus}
                detectionActive={detectionActiveRef.current}
                cameraError={cameraError}
                onRestart={restartCamera}
              />
            </div> */}
          </div>

          {/* Rodapé Informativo (Melhorado) */}
          <footer className="mt-16 text-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-5xl mx-auto border-t-4 border-cyan-500"> {/* Borda Cyan */}
              <h3 className="text-2xl font-extrabold text-gray-900 mb-5 flex items-center justify-center gap-3">
                <span className="text-blue-600 text-3xl">🩺</span> {/* Cor primária Blue */}
                Prepare-se para Sua Consulta
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-700">
                <div className="p-3 bg-cyan-50 rounded-xl shadow-inner font-semibold"> {/* Fundo Cyan 50 */}
                  <span className="text-cyan-500 block mb-1">1. 💡</span> {/* Texto Cyan */}
                  Boa Iluminação
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl shadow-inner font-semibold"> {/* Fundo Cyan 50 */}
                  <span className="text-cyan-500 block mb-1">2. 🖼️</span> {/* Texto Cyan */}
                  Fundo Neutro
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl shadow-inner font-semibold"> {/* Fundo Cyan 50 */}
                  <span className="text-cyan-500 block mb-1">3. 📶</span> {/* Texto Cyan */}
                  Internet Estável
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl shadow-inner font-semibold"> {/* Fundo Cyan 50 */}
                  <span className="text-cyan-500 block mb-1">4. 🔇</span> {/* Texto Cyan */}
                  Sem Interrupções
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Layout>
  );
}