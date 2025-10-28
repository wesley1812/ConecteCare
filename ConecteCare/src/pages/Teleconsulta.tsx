import { useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
// Importações do MediaPipe
// Assegura que todas as classes necessárias são importadas
import { PoseLandmarker, FilesetResolver, DrawingUtils, type NormalizedLandmark } from '@mediapipe/tasks-vision';

type PoseLandmarkerInstance = Awaited<ReturnType<typeof PoseLandmarker.createFromOptions>> | null;

// Índices dos landmarks (sem alterações)
const LEFT_SHOULDER = 11, RIGHT_SHOULDER = 12, LEFT_HIP = 23, RIGHT_HIP = 24, LEFT_KNEE = 25, RIGHT_KNEE = 26;
const LEFT_EYE = 2, RIGHT_EYE = 5, NOSE = 0, MOUTH_LEFT = 9, MOUTH_RIGHT = 10, LEFT_EAR = 7, RIGHT_EAR = 8;

// Limiares (sem alterações)
const VISIBILITY_THRESHOLD = 0.5;
const BODY_OUT_THRESHOLD = 3;
const FACE_CLOSE_THRESHOLD = 0.4;
const FRAME_MARGIN = 0.05;

// Variáveis para mensagens de feedback (sem alterações)
const MSG_OK = "Posição correta!";
const MSG_SEM_DETECCAO = "Nenhuma pessoa detetada.";
const MSG_CORPO_FORA = "Corpo parcialmente fora da câmera. Afaste-se um pouco.";
const MSG_ROSTO_PROXIMO = "Rosto muito próximo da câmera. Afaste-se um pouco.";
const MSG_ROSTO_FORA = "Parte do rosto fora da câmera. Centralize-se.";


export function Teleconsulta() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarkerInstance>(null);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(MSG_SEM_DETECCAO); // Mensagem inicial

  // 1. Inicializa o PoseLandmarker
  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        // Assegura que FilesetResolver está disponível
        if (!FilesetResolver) {
            console.error("FilesetResolver is not available.");
            setError("Falha ao carregar dependências do MediaPipe."); setLoading(false); return;
        }
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
         // Assegura que PoseLandmarker está disponível
        if (!PoseLandmarker) {
             console.error("PoseLandmarker is not available.");
             setError("Falha ao carregar o modelo de deteção."); setLoading(false); return;
         }
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: `/pose_landmarker_full.task`, delegate: "GPU" },
          runningMode: "VIDEO", numPoses: 1
        });
        setPoseLandmarker(landmarker); setLoading(false); console.log("PoseLandmarker loaded successfully.");
      } catch (err) {
        console.error("Error loading PoseLandmarker:", err);
        setError("Falha ao carregar o modelo de deteção. Verifique a consola."); setLoading(false);
      }
    };
    createPoseLandmarker();
  }, []);

  // 2. Ajusta o tamanho do Canvas
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const handleVideoPlay = () => {
      // Verifica se video, canvas existem E se as dimensões do vídeo são válidas
      if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        console.log(`Canvas base size set to ${video.videoWidth}x${video.videoHeight}`);
        // Tenta redimensionar baseado no container (opcional, mas bom para layout fixo)
        const container = canvas.parentElement;
        if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const videoRatio = video.videoWidth / video.videoHeight;
            const containerRatio = containerWidth / containerHeight;
            // Ajusta o estilo para encaixar no container mantendo a proporção
            if (containerRatio > videoRatio) { // Container mais largo
                 canvas.style.height = `${containerHeight}px`;
                 canvas.style.width = `${containerHeight * videoRatio}px`;
            } else { // Container mais alto (ou proporção igual)
                 canvas.style.width = `${containerWidth}px`;
                 canvas.style.height = `${containerWidth / videoRatio}px`;
            }
             console.log(`Canvas display size adjusted`);
        }
      } else if (video && video.readyState >= 2) { // Tenta novamente se metadados carregaram mas dimensões são 0
          console.warn("Video dimensions 0, retrying resize...");
          // Tenta novamente após um pequeno atraso
          setTimeout(handleVideoPlay, 100);
      }
    };
    if (video) video.addEventListener('loadedmetadata', handleVideoPlay);
    window.addEventListener('resize', handleVideoPlay); // Recalcula ao redimensionar a janela
    return () => {
      if (video) video.removeEventListener('loadedmetadata', handleVideoPlay);
      window.removeEventListener('resize', handleVideoPlay);
    };
  }, [webcamRunning]); // Depende de webcamRunning para re-executar

  // 3. Função para Iniciar/Parar a Webcam (Refinada)
   const enableCam = async () => {
     if (!poseLandmarker) {
       setError("Modelo de deteção ainda não está pronto."); return;
     }
     if (webcamRunning) { // Desativar
       console.log("Stopping webcam...");
       if (videoRef.current?.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
         videoRef.current.srcObject = null;
       }
       if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
       animationFrameId.current = null;
       const canvasCtx = canvasRef.current?.getContext("2d");
       if(canvasCtx && canvasRef.current) canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
       setWebcamRunning(false);
       setFeedbackMessage(MSG_SEM_DETECCAO); // Reseta a mensagem ao parar
       console.log("Webcam stopped.");
     } else { // Ativar
       setError(null); // Limpa erros anteriores
       setFeedbackMessage("A iniciar câmera..."); // Feedback enquanto inicia
       try {
         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
         if (videoRef.current) {
           videoRef.current.srcObject = stream;
           // Tenta iniciar a reprodução
           await videoRef.current.play();
           console.log("Video play initiated. Setting webcamRunning true and starting loop.");
           // *** Define o estado e inicia o loop AQUI ***
           setWebcamRunning(true);
           // Cancela qualquer loop anterior que possa estar pendente (segurança)
           if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
           // Inicia o novo loop
           animationFrameId.current = requestAnimationFrame(predictWebcam);
         }
       } catch (err) {
         console.error("Error accessing/playing webcam:", err);
         setError("Não foi possível acessar ou reproduzir a câmera. Verifique as permissões.");
         setWebcamRunning(false);
         setFeedbackMessage(MSG_SEM_DETECCAO); // Reseta mensagem em caso de erro
       }
     }
   };

  // 4. Função de Feedback (Retorna variáveis, com verificações 'undefined')
  const checkPoseAndFeedback = (landmarks: NormalizedLandmark[], _videoWidth: number, _videoHeight: number): string => {
    // A verificação de landmarks vazios é feita no loop
    const bodyPoints = [landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER], landmarks[LEFT_HIP], landmarks[RIGHT_HIP], landmarks[LEFT_KNEE], landmarks[RIGHT_KNEE]];
    let invisibleBodyPoints = 0;
    for (const point of bodyPoints) {
      // Verifica se 'visibility' existe antes de comparar
      if (!point || point.visibility === undefined || point.visibility < VISIBILITY_THRESHOLD || point.x < FRAME_MARGIN || point.x > 1 - FRAME_MARGIN || point.y < FRAME_MARGIN || point.y > 1 - FRAME_MARGIN) invisibleBodyPoints++;
    }
    if (invisibleBodyPoints >= BODY_OUT_THRESHOLD) return MSG_CORPO_FORA;

    const leftEar = landmarks[LEFT_EAR], rightEar = landmarks[RIGHT_EAR];
    // Verifica existência E visibilidade antes de comparar
    if (leftEar && rightEar && leftEar.visibility !== undefined && leftEar.visibility > VISIBILITY_THRESHOLD && rightEar.visibility !== undefined && rightEar.visibility > VISIBILITY_THRESHOLD) {
      if (Math.abs(leftEar.x - rightEar.x) > FACE_CLOSE_THRESHOLD) return MSG_ROSTO_PROXIMO;
    } else {
        const leftEye = landmarks[LEFT_EYE], rightEye = landmarks[RIGHT_EYE];
        if(leftEye && rightEye && leftEye.visibility !== undefined && leftEye.visibility > VISIBILITY_THRESHOLD && rightEye.visibility !== undefined && rightEye.visibility > VISIBILITY_THRESHOLD){
             if (Math.abs(leftEye.x - rightEye.x) > FACE_CLOSE_THRESHOLD / 1.8) return MSG_ROSTO_PROXIMO;
        }
    }

    const faceKeyPoints = [landmarks[LEFT_EYE], landmarks[RIGHT_EYE], landmarks[NOSE], landmarks[MOUTH_LEFT], landmarks[MOUTH_RIGHT]];
    for (const point of faceKeyPoints) {
       if (!point || point.visibility === undefined || point.visibility < VISIBILITY_THRESHOLD || point.x < FRAME_MARGIN || point.x > 1 - FRAME_MARGIN || point.y < FRAME_MARGIN || point.y > 1 - FRAME_MARGIN) return MSG_ROSTO_FORA;
    }
    return MSG_OK;
  };


  // 5. Loop de Predição (Refinado)
  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Condição de paragem mais robusta
    if (!webcamRunning || !poseLandmarker || !video || video.paused || video.ended || video.readyState < 3) { // readyState 3 (HAVE_FUTURE_DATA) ou 4 (HAVE_ENOUGH_DATA)
      // console.log("Predict loop stopping check. State:", { webcamRunning }); // Depuração
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
      // Mantém a última mensagem de feedback ao parar, a menos que a webcam seja desligada (tratado em enableCam)
      return;
    }

    // Ajuste de tamanho do canvas
    if (canvas && video && video.videoWidth > 0 && video.videoHeight > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    try {
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            // Verifica se o contexto do canvas ainda é válido
            const currentCtx = canvasRef.current?.getContext("2d");
            if (!currentCtx || !canvasRef.current) return;

            currentCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Verifica se DrawingUtils está disponível
            if (!DrawingUtils) {
                 console.error("DrawingUtils is not available in callback."); return;
            }
            const drawingUtils = new DrawingUtils(currentCtx);
            let currentFeedback: string = MSG_SEM_DETECCAO; // Assume "não detetado" por defeito

            // Verifica se há landmarks e se o primeiro array não está vazio
            if (result.landmarks && result.landmarks.length > 0 && result.landmarks[0].length > 0) {
                const landmarks = result.landmarks[0]; // Pega o primeiro conjunto de landmarks (assumindo numPoses: 1)
                // Verifica se PoseLandmarker.POSE_CONNECTIONS está disponível
                if (PoseLandmarker.POSE_CONNECTIONS) {
                    drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 }); // Conexões verdes
                } else {
                     console.warn("PoseLandmarker.POSE_CONNECTIONS not available.");
                }
                drawingUtils.drawLandmarks(landmarks, { radius: 3, color: '#FF0000', fillColor: '#FF0000' }); // Pontos vermelhos menores
                currentFeedback = checkPoseAndFeedback(landmarks, video.videoWidth, video.videoHeight);
            }
            // Atualiza o estado da mensagem de feedback usando callback
            setFeedbackMessage(prev => prev !== currentFeedback ? currentFeedback : prev);
        });
    } catch(detectionError) {
         console.error("Error during pose detection:", detectionError);
         setError("Ocorreu um erro durante a deteção da pose.");
         // Para o loop e a webcam em caso de erro
         if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
         animationFrameId.current = null;
         setWebcamRunning(false);
         // Opcional: Tentar parar as tracks da câmera
         if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
         }
         return; // Sai da função
    }

    // Continua o loop SE a webcam ainda estiver ativa
    if (webcamRunning) {
        animationFrameId.current = requestAnimationFrame(predictWebcam);
    } else {
       // Garante que para se a webcam foi desativada
       if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
       animationFrameId.current = null;
    }
  };

  // --- Renderização ---
  if (loading) {
     return (
       <Layout>
         <div className="text-center py-20 min-h-screen flex items-center justify-center bg-gray-50">
           <p className="text-lg text-gray-600">A carregar modelo de deteção de pose...</p>
         </div>
       </Layout>
     );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Monitorização de Pontos Corporais
        </h1>
        <p className="text-center text-gray-600 mb-6 max-w-xl">
          Posicione-se em frente à câmera. O sistema detetará os pontos chave do seu corpo em tempo real.
          Certifique-se de que seu corpo esteja visível.
        </p>

        {error && (
           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-4xl text-center" role="alert">
             <p className="font-bold">Erro</p>
             <p>{error}</p>
           </div>
         )}

        {/* Flex container para vídeo e painel de feedback */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-6">

          {/* Coluna Esquerda: Vídeo e Canvas */}
          <div className="relative w-full lg:w-3/4 aspect-video bg-gray-800 rounded-lg shadow-xl overflow-hidden self-center lg:self-stretch">
            <video
              ref={videoRef}
              playsInline muted
              // object-contain evita cortar a imagem do vídeo
              className="absolute top-0 left-0 w-full h-full object-contain"
            ></video>
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ zIndex: 1 }} // Canvas sobrepõe o vídeo
             ></canvas>
             {/* Placeholder de Câmera Inativa */}
             {!webcamRunning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                   <p className="text-white text-xl font-semibold">Câmera inativa</p>
                </div>
              )}
          </div>

          {/* Coluna Direita: Painel de Feedback */}
          <div className="w-full lg:w-1/4 p-4 bg-white rounded-lg shadow-lg flex flex-col">
             <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2 flex-shrink-0">Status da Posição</h2>
             <div className="flex-grow flex items-center justify-center min-h-[60px]"> {/* Altura mínima para o feedback */}
                 {/* Mostra feedback SE webcam ativa E mensagem existe */}
                 {webcamRunning && feedbackMessage ? (
                     <div className={`p-3 rounded-md text-center font-medium w-full transition-colors duration-300 ${
                         feedbackMessage === MSG_OK ? 'bg-green-100 text-green-800' :
                         feedbackMessage === MSG_SEM_DETECCAO ? 'bg-gray-100 text-gray-600' :
                         'bg-yellow-100 text-yellow-800 animate-pulse'
                     }`}>
                         {feedbackMessage}
                     </div>
                 ) : (
                     <p className="text-gray-500 italic text-center">
                         {/* Mensagem ajustada para o estado inicial */}
                         {loading ? 'A carregar modelo...' : (!webcamRunning ? 'Ative a câmera para iniciar.' : MSG_SEM_DETECCAO)}
                     </p>
                 )}
             </div>
             {/* Verificações */}
             <div className="mt-4 text-sm text-gray-600 space-y-1 flex-shrink-0">
                <p><strong>Verificações:</strong></p>
                <ul className="list-disc list-inside ml-2">
                    <li>Corpo visível</li>
                    <li>Distância adequada</li>
                    <li>Rosto centralizado</li>
                </ul>
             </div>
          </div>

        </div> {/* Fim do flex container (vídeo + feedback) */}

        {/* Botão Ativar/Desativar Câmera */}
        <button
          onClick={enableCam}
          disabled={loading || !poseLandmarker} // Desativa também se o landmarker não carregou
          className={`mt-6 px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${webcamRunning ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'} ${loading || !poseLandmarker ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {webcamRunning ? 'Desativar Câmera' : 'Ativar Câmera'}
        </button>

      </div>
    </Layout>
  );
};

