import { useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
// *** CORREÇÃO DA IMPORTAÇÃO ***
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
            setError("Falha ao carregar dependências do MediaPipe.");
            setLoading(false);
            return;
        }
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
         // Assegura que PoseLandmarker está disponível
        if (!PoseLandmarker) {
             console.error("PoseLandmarker is not available.");
             setError("Falha ao carregar o modelo de deteção.");
             setLoading(false);
             return;
         }
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
        setError("Falha ao carregar o modelo de deteção. Verifique a consola para mais detalhes.");
        setLoading(false);
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
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
          console.warn("Video dimensions not ready on loadedmetadata, retrying resize...");
          // Tenta novamente após um pequeno atraso
          setTimeout(handleVideoPlay, 100);
      }
    };

    if (video) {
      // 'loadedmetadata' é geralmente o melhor evento para obter dimensões
      video.addEventListener('loadedmetadata', handleVideoPlay);
      // 'resize' da janela para ajustar se o layout mudar
      window.addEventListener('resize', handleVideoPlay);
    }
    // Cleanup
    return () => {
      if (video) video.removeEventListener('loadedmetadata', handleVideoPlay);
      window.removeEventListener('resize', handleVideoPlay);
    };
  }, [webcamRunning]); // Depende de webcamRunning para re-executar se a câmera for ligada/desligada

  // 3. Função para Iniciar/Parar a Webcam (Refinada)
   const enableCam = async () => {
     if (!poseLandmarker) {
       console.log("PoseLandmarker not ready yet.");
       setError("Modelo de deteção ainda não está pronto.");
       return;
     }
     if (webcamRunning) { // Desativar
       console.log("Stopping webcam...");
       if (videoRef.current?.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
         videoRef.current.srcObject = null;
       }
       // Cancela o loop de animação se estiver a correr
       if (animationFrameId.current) {
           cancelAnimationFrame(animationFrameId.current);
           animationFrameId.current = null;
           console.log("Prediction loop cancelled.");
       }
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
           // Define um handler para o evento 'playing' que só corre uma vez
           const playingHandler = () => {
                // Verifica se já não está a correr para evitar múltiplos inícios
               if (!webcamRunning && !animationFrameId.current) {
                   setWebcamRunning(true);
                   console.log("Webcam playing, starting prediction loop.");
                   // Garante que o estado webcamRunning está atualizado antes de chamar predict
                   requestAnimationFrame(predictWebcam); // Inicia o loop de forma segura
               }
           };
           videoRef.current.addEventListener('playing', playingHandler, { once: true }); // Executa o listener apenas uma vez
           await videoRef.current.play(); // Tenta iniciar a reprodução
           console.log("Video play initiated.");
         }
       } catch (err) {
         console.error("Error accessing webcam:", err);
         setError("Não foi possível acessar sua câmera. Verifique as permissões do navegador.");
         setWebcamRunning(false); // Garante que o estado reflita a falha
         setFeedbackMessage(MSG_SEM_DETECCAO); // Reseta mensagem em caso de erro
       }
     }
   };

  // 4. Função de Feedback (Retorna variáveis)
  const checkPoseAndFeedback = (landmarks: NormalizedLandmark[], _videoWidth: number, _videoHeight: number): string => { // Garante retorno string
    // Nenhuma pessoa detetada já é tratado no loop principal se landmarks for vazio
    // if (!landmarks || landmarks.length === 0) return MSG_SEM_DETECCAO; // Removido daqui

    const bodyPoints = [landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER], landmarks[LEFT_HIP], landmarks[RIGHT_HIP], landmarks[LEFT_KNEE], landmarks[RIGHT_KNEE]];
    let invisibleBodyPoints = 0;
    for (const point of bodyPoints) {
      // Adiciona verificação de existência antes de aceder a propriedades
      if (!point || point.visibility === undefined || point.visibility < VISIBILITY_THRESHOLD || point.x < FRAME_MARGIN || point.x > 1 - FRAME_MARGIN || point.y < FRAME_MARGIN || point.y > 1 - FRAME_MARGIN) invisibleBodyPoints++;
    }
    if (invisibleBodyPoints >= BODY_OUT_THRESHOLD) {
        // console.log("Feedback: Corpo Fora"); // Para depuração
        return MSG_CORPO_FORA;
    }

    const leftEar = landmarks[LEFT_EAR], rightEar = landmarks[RIGHT_EAR];
    // Adiciona verificação de existência e visibilidade
    if (leftEar && rightEar && leftEar.visibility !== undefined && leftEar.visibility > VISIBILITY_THRESHOLD && rightEar.visibility !== undefined && rightEar.visibility > VISIBILITY_THRESHOLD) {
      if (Math.abs(leftEar.x - rightEar.x) > FACE_CLOSE_THRESHOLD) {
        // console.log("Feedback: Rosto Próximo (Orelhas)"); // Para depuração
        return MSG_ROSTO_PROXIMO;
      }
    } else { // Fallback usando os olhos
        const leftEye = landmarks[LEFT_EYE], rightEye = landmarks[RIGHT_EYE];
        // Adiciona verificação de existência e visibilidade
        if(leftEye && rightEye && leftEye.visibility !== undefined && leftEye.visibility > VISIBILITY_THRESHOLD && rightEye.visibility !== undefined && rightEye.visibility > VISIBILITY_THRESHOLD){
             if (Math.abs(leftEye.x - rightEye.x) > FACE_CLOSE_THRESHOLD / 1.8) { // Ajuste o limiar se necessário
                // console.log("Feedback: Rosto Próximo (Olhos)"); // Para depuração
                return MSG_ROSTO_PROXIMO;
             }
        }
    }

    const faceKeyPoints = [landmarks[LEFT_EYE], landmarks[RIGHT_EYE], landmarks[NOSE], landmarks[MOUTH_LEFT], landmarks[MOUTH_RIGHT]];
    for (const point of faceKeyPoints) {
       // Adiciona verificação de existência e visibilidade
       if (!point || point.visibility === undefined || point.visibility < VISIBILITY_THRESHOLD || point.x < FRAME_MARGIN || point.x > 1 - FRAME_MARGIN || point.y < FRAME_MARGIN || point.y > 1 - FRAME_MARGIN) {
            // console.log("Feedback: Rosto Fora"); // Para depuração
            return MSG_ROSTO_FORA;
       }
    }

    // Se passou por todas as verificações, retorna a mensagem de sucesso
    // console.log("Feedback: OK"); // Para depuração
    return MSG_OK;
  };


  // 5. Loop de Predição (Lógica de feedback ajustada)
  const predictWebcam = () => {
    // console.log("Predict loop running..."); // Para depuração
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    // Condição de paragem mais robusta
    // Verifica se a webcam está a correr E se o landmarker está carregado
    if (!webcamRunning || !poseLandmarker || !video || video.paused || video.ended || video.readyState < 3) { // readyState 3 (HAVE_FUTURE_DATA) ou 4 (HAVE_ENOUGH_DATA)
      console.log("Stopping prediction loop. State:", { webcamRunning, poseLandmarker: !!poseLandmarker, video: !!video, paused: video?.paused, ended: video?.ended, readyState: video?.readyState });
      // Se o loop estava a correr, cancela-o
      if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
      }
      // Não define feedback aqui para manter a última mensagem válida ou a inicial
      return;
    }

    // Garante que o canvas tem o tamanho certo
    // Verifica videoWidth e videoHeight > 0 para evitar erros
    if (canvas && video && video.videoWidth > 0 && video.videoHeight > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // console.log("Canvas resized in loop"); // Para depuração
    }

    const startTimeMs = performance.now();
    try {
        // console.log("Calling detectForVideo..."); // Para depuração
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            // console.log("Detection result:", result); // Para depuração
            if (!canvasCtx || !canvas) {
                console.warn("Canvas context not available in callback.");
                return;
            }
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            // Assegura que DrawingUtils está disponível
             if (!DrawingUtils) {
                 console.error("DrawingUtils is not available in callback.");
                 setError("Falha ao carregar utilitários de desenho.");
                 return; // Sai se não puder desenhar
             }
            const drawingUtils = new DrawingUtils(canvasCtx);
            let currentFeedback: string = MSG_SEM_DETECCAO; // Assume "não detetado" inicialmente

            if (result.landmarks && result.landmarks.length > 0 && result.landmarks[0]) { // Verifica se há landmarks[0]
                // Se detetar landmarks, processa
                const landmarks = result.landmarks[0]; // Pega o primeiro conjunto de landmarks
                drawingUtils.drawLandmarks(landmarks, { radius: (data) => DrawingUtils.lerp(data.from!.z ?? 0, -0.15, 0.1, 5, 1), fillColor: '#FF0000' }); // Pontos vermelhos
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: '#00FF00' }); // Conexões verdes

                // Chama a função de verificação para obter o feedback
                currentFeedback = checkPoseAndFeedback(landmarks, video.videoWidth, video.videoHeight);
                // console.log("Current Feedback:", currentFeedback); // Para depuração
            }
            // Atualiza o estado da mensagem de feedback DE FORMA SEGURA
            setFeedbackMessage(prev => {
                if (prev !== currentFeedback) {
                    // console.log("Updating feedback state to:", currentFeedback); // Para depuração
                    return currentFeedback;
                }
                return prev; // Mantém o estado se a mensagem for a mesma
            });
        });
    } catch(detectionError) {
         console.error("Error during pose detection:", detectionError);
         setError("Ocorreu um erro durante a deteção da pose."); // Define um erro para o utilizador
         // Para o loop em caso de erro grave na deteção
         if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
         animationFrameId.current = null;
         setWebcamRunning(false); // Para indicar que parou
         return; // Sai da função
    }

    // Continua o loop SE a webcam ainda estiver ativa
    if (webcamRunning) {
        animationFrameId.current = requestAnimationFrame(predictWebcam);
    } else {
        // Garante que para se a webcam foi desativada entretanto
       if (animationFrameId.current) {
           cancelAnimationFrame(animationFrameId.current);
           animationFrameId.current = null;
           console.log("Prediction loop stopped because webcamRunning is false.");
       }
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
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-6"> {/* items-stretch */}

          {/* Coluna Esquerda: Vídeo e Canvas */}
          <div className="relative w-full lg:w-3/4 aspect-video bg-gray-800 rounded-lg shadow-xl overflow-hidden self-center lg:self-stretch">
            <video
              ref={videoRef}
              playsInline muted
              className="absolute top-0 left-0 w-full h-full object-contain"
            ></video>
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ zIndex: 1 }}
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
             <div className="flex-grow flex items-center justify-center min-h-[60px]"> {/* Altura mínima para evitar colapso */}
                 {/* Mostra feedback APENAS se a webcam estiver ativa */}
                 {webcamRunning && feedbackMessage ? (
                     <div className={`p-3 rounded-md text-center font-medium w-full transition-colors duration-300 ${ // Adiciona transição
                         feedbackMessage === MSG_OK
                           ? 'bg-green-100 text-green-800' // Estilo de sucesso
                           : feedbackMessage === MSG_SEM_DETECCAO
                               ? 'bg-gray-100 text-gray-600' // Estilo neutro
                               : 'bg-yellow-100 text-yellow-800 animate-pulse' // Estilo de aviso
                     }`}>
                         {feedbackMessage}
                     </div>
                 ) : (
                     <p className="text-gray-500 italic text-center">
                         {/* Mensagem mais clara se a webcam estiver desligada */}
                         {!webcamRunning ? 'Ative a câmera para iniciar.' : (loading ? 'A carregar...' : MSG_SEM_DETECCAO) }
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

        </div> {/* Fim do flex container */}

        {/* Botão Ativar/Desativar */}
        <button
          onClick={enableCam}
          // Desativa se estiver a carregar OU se o poseLandmarker não estiver pronto
          disabled={loading || !poseLandmarker}
          className={`mt-6 px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${webcamRunning ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'} ${loading || !poseLandmarker ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {webcamRunning ? 'Desativar Câmera' : 'Ativar Câmera'}
        </button>

      </div>
    </Layout>
  );
};

