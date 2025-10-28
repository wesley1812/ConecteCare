import { useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
// Importações do MediaPipe
import { PoseLandmarker, FilesetResolver, DrawingUtils, type NormalizedLandmark } from '@mediapipe/tasks-vision';

type PoseLandmarkerInstance = Awaited<ReturnType<typeof PoseLandmarker.createFromOptions>> | null;

// Índices dos landmarks relevantes (baseado na documentação do MediaPipe Pose)
const LEFT_SHOULDER = 11; 
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const LEFT_KNEE = 25;
const RIGHT_KNEE = 26;
const LEFT_EYE = 2;
const RIGHT_EYE = 5;
const NOSE = 0;
const MOUTH_LEFT = 9;
const MOUTH_RIGHT = 10;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;

// Limiares (ajuste conforme necessário)
const VISIBILITY_THRESHOLD = 0.5; // Visibilidade mínima para considerar um ponto "visível"
const BODY_OUT_THRESHOLD = 3;   // Quantos pontos corporais chave podem estar 'invisíveis' antes de avisar
const FACE_CLOSE_THRESHOLD = 0.4; // Se a largura do rosto (orelha a orelha) for > 40% da largura do vídeo
const FRAME_MARGIN = 0.05; // Margem para considerar pontos "na borda" (5%)

export function Teleconsulta() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarkerInstance>(null);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // 1. Inicializa o PoseLandmarker (sem alterações)
  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@medipe/tasks-vision@latest/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `/pose_landmarker_full.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        setPoseLandmarker(landmarker);
        setLoading(false);
        console.log("PoseLandmarker loaded successfully.");
      } catch (err) {
        console.error("Error loading PoseLandmarker:", err);
        setError("Falha ao carregar o modelo de detecção de pose.");
        setLoading(false);
      }
    };
    createPoseLandmarker();
  }, []);

  // 2. Ajusta o tamanho do Canvas (sem alterações)
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const handleVideoPlay = () => {
      if (video && canvas) {
        // Define o tamanho base do canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(`Canvas base size set to ${video.videoWidth}x${video.videoHeight}`);

        // Redimensiona o canvas para preencher o container mantendo o aspect ratio
        // Isso é importante se o container tiver tamanho fixo (aspect-video)
        const container = canvas.parentElement;
        if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const videoRatio = video.videoWidth / video.videoHeight;
            const containerRatio = containerWidth / containerHeight;

            if (containerRatio > videoRatio) {
                // Container mais largo que o vídeo, altura limita
                 canvas.style.height = `${containerHeight}px`;
                 canvas.style.width = `${containerHeight * videoRatio}px`;
            } else {
                 // Container mais alto que o vídeo, largura limita
                 canvas.style.width = `${containerWidth}px`;
                 canvas.style.height = `${containerWidth / videoRatio}px`;
            }
             console.log(`Canvas display size set to ${canvas.style.width} x ${canvas.style.height}`);
        }
      }
    };

    if (video) {
      video.addEventListener('loadedmetadata', handleVideoPlay);
      // Recalcula ao redimensionar a janela
      window.addEventListener('resize', handleVideoPlay);
    }

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', handleVideoPlay);
      }
       window.removeEventListener('resize', handleVideoPlay);
    };
  }, [webcamRunning]); // Roda quando a webcam é ativada/desativada e ajusta com resize

  // 3. Função para Iniciar/Parar a Webcam (sem alterações)
   const enableCam = async () => {
     if (!poseLandmarker) {
       console.log("PoseLandmarker not ready yet.");
       setError("Modelo de detecção ainda não está pronto.");
       return;
     }

     if (webcamRunning) {
       // Desativar
       if (videoRef.current && videoRef.current.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
         videoRef.current.srcObject = null;
       }
       if (animationFrameId.current) {
         cancelAnimationFrame(animationFrameId.current);
         animationFrameId.current = null;
       }
       const canvasCtx = canvasRef.current?.getContext("2d");
       if(canvasCtx && canvasRef.current){
         canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
       }
       setWebcamRunning(false);
       setFeedbackMessage(null); // Limpa feedback ao parar
       console.log("Webcam stopped.");
     } else {
       // Ativar
       setError(null);
       try {
         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
         if (videoRef.current) {
           videoRef.current.srcObject = stream;
           // Não precisa mais do onloadedmetadata aqui se o outro useEffect já cuida disso
           videoRef.current.play().then(() => { // Garante que play() foi chamado
             setWebcamRunning(true);
             console.log("Webcam started, starting prediction loop.");
             predictWebcam(); // Inicia o loop após play
           }).catch(playError => {
              console.error("Error playing video:", playError);
              setError("Erro ao iniciar a reprodução do vídeo.");
              setWebcamRunning(false);
           });
         }
       } catch (err) {
         console.error("Error accessing webcam:", err);
         setError("Não foi possível acessar sua câmera. Verifique as permissões do navegador.");
         setWebcamRunning(false);
       }
     }
   };

  // *** FUNÇÃO DE FEEDBACK ATUALIZADA ***
  const checkPoseAndFeedback = (landmarks: NormalizedLandmark[], videoWidth: number, videoHeight: number): string | null => {
    if (!landmarks || landmarks.length === 0) {
      return "Nenhuma pessoa detectada. Posicione-se em frente à câmera.";
    }

    // --- Verificação 1: Corpo Fora da Câmera ---
    const bodyPoints = [landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER], landmarks[LEFT_HIP], landmarks[RIGHT_HIP], landmarks[LEFT_KNEE], landmarks[RIGHT_KNEE]];
    let invisibleBodyPoints = 0;
    for (const point of bodyPoints) {
      if (!point || point.visibility < VISIBILITY_THRESHOLD || point.x < FRAME_MARGIN || point.x > 1 - FRAME_MARGIN || point.y < FRAME_MARGIN || point.y > 1 - FRAME_MARGIN) {
        invisibleBodyPoints++;
      }
    }
    if (invisibleBodyPoints >= BODY_OUT_THRESHOLD) {
      return "Corpo parcialmente fora da câmera. Afaste-se um pouco.";
    }

    // --- Verificação 2: Rosto Muito Próximo ---
    const leftEar = landmarks[LEFT_EAR];
    const rightEar = landmarks[RIGHT_EAR];
    if (leftEar && rightEar && leftEar.visibility > VISIBILITY_THRESHOLD && rightEar.visibility > VISIBILITY_THRESHOLD) {
      const faceWidth = Math.abs(leftEar.x - rightEar.x);
      if (faceWidth > FACE_CLOSE_THRESHOLD) {
        return "Rosto muito próximo da câmera. Afaste-se um pouco.";
      }
    } else {
        const leftEye = landmarks[LEFT_EYE];
        const rightEye = landmarks[RIGHT_EYE];
        if(leftEye && rightEye && leftEye.visibility > VISIBILITY_THRESHOLD && rightEye.visibility > VISIBILITY_THRESHOLD){
            const eyeDist = Math.abs(leftEye.x - rightEye.x);
             // Ajuste o limiar se necessário, pode ser diferente da largura das orelhas
             if (eyeDist > FACE_CLOSE_THRESHOLD / 1.8) {
                 return "Rosto muito próximo da câmera. Afaste-se um pouco.";
             }
        }
    }

    // --- Verificação 3: Parte do Rosto Faltando ---
    const faceKeyPoints = [landmarks[LEFT_EYE], landmarks[RIGHT_EYE], landmarks[NOSE], landmarks[MOUTH_LEFT], landmarks[MOUTH_RIGHT]];
    for (const point of faceKeyPoints) {
       if (!point || point.visibility < VISIBILITY_THRESHOLD || point.x < FRAME_MARGIN || point.x > 1 - FRAME_MARGIN || point.y < FRAME_MARGIN || point.y > 1 - FRAME_MARGIN) {
         return "Parte do rosto fora da câmera. Centralize-se.";
       }
    }

    // *** RETORNO DE SUCESSO ***
    // Se passou por todas as verificações
    return "Posição correta!"; // Mensagem de sucesso
  };


  // 4. Loop de Predição (sem alterações na lógica principal)
  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    if (!video || !canvas || !canvasCtx || !poseLandmarker || !webcamRunning || video.readyState < 2) { // Adiciona verificação de readyState
        // Se o vídeo não está pronto, tenta novamente em breve
        if (webcamRunning && animationFrameId.current === null) { // Evita múltiplos loops
             animationFrameId.current = requestAnimationFrame(predictWebcam);
        } else if (!webcamRunning && animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        return;
    }

    // Reajusta tamanho caso tenha mudado dinamicamente
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

    const startTimeMs = performance.now();
    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
        if (!canvasCtx || !canvas) return; // Checagem extra de segurança
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        const drawingUtils = new DrawingUtils(canvasCtx);

        let currentFeedback: string | null = "Nenhuma pessoa detectada.";

        if (result.landmarks && result.landmarks.length > 0) {
            for (const landmarks of result.landmarks) {
                drawingUtils.drawLandmarks(landmarks, { radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1) });
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
                currentFeedback = checkPoseAndFeedback(landmarks, video.videoWidth, video.videoHeight);
            }
        }
        setFeedbackMessage(currentFeedback);
    });

    if (webcamRunning) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    } else {
       if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
       animationFrameId.current = null;
    }
  };

  // --- Renderização ---
  if (loading) {
     return (
       <Layout>
         <div className="text-center py-20 min-h-screen flex items-center justify-center bg-gray-50">
           <p className="text-lg text-gray-600">Carregando modelo de detecção de pose...</p>
         </div>
       </Layout>
     );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Monitoramento de Pontos Corporais
        </h1>
        <p className="text-center text-gray-600 mb-6 max-w-xl">
          Posicione-se em frente à câmera. O sistema detectará os pontos chave do seu corpo em tempo real.
          Certifique-se de que seu corpo esteja visível.
        </p>

        {error && (
           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-2xl text-center" role="alert">
             <p className="font-bold">Erro</p>
             <p>{error}</p>
           </div>
         )}

        {/* Container com aspect ratio para manter proporção */}
        <div className="relative w-full max-w-4xl aspect-video mx-auto mb-6 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <video
            ref={videoRef}
            // autoPlay // Autoplay pode ser problemático, melhor iniciar no enableCam
            playsInline
            muted
            className="absolute top-0 left-0 w-full h-full object-contain" // object-contain para não cortar
          ></video>
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full" // Canvas sobrepõe o vídeo
            style={{ zIndex: 1 }} // Garante que o canvas fique por cima
           ></canvas>

          {/* *** EXIBIÇÃO DA MENSAGEM DE FEEDBACK ATUALIZADA *** */}
          {webcamRunning && feedbackMessage && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 font-semibold px-4 py-2 rounded-md shadow-lg text-center ${
              feedbackMessage === "Posição correta!"
                ? 'bg-green-500 text-white' // Estilo de sucesso (verde)
                : 'bg-yellow-400 text-yellow-900 animate-pulse' // Estilo de aviso (amarelo piscando)
            }`} style={{ zIndex: 2 }}> {/* zIndex maior para ficar sobre o canvas */}
              {feedbackMessage}
            </div>
          )}

           {!webcamRunning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                 <p className="text-white text-xl font-semibold">Câmera inativa</p>
              </div>
            )}
        </div>

        <button
          onClick={enableCam}
          disabled={loading}
          className={`px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${webcamRunning ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {webcamRunning ? 'Desativar Câmera' : 'Ativar Câmera'}
        </button>

      </div>
    </Layout>
  );
};

