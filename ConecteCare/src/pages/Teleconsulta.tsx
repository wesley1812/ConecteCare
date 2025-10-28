import { useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
// Importações do MediaPipe
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

// Tipagem para simplificar
type PoseLandmarkerInstance = Awaited<ReturnType<typeof PoseLandmarker.createFromOptions>> | null;

export function Teleconsulta() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Estados do MediaPipe e Webcam
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarkerInstance>(null);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Estado para o carregamento do modelo
  const [error, setError] = useState<string | null>(null);

  // 1. Inicializa o PoseLandmarker
  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm" // Local padrão do WASM
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            // Caminho para o seu modelo .task
            modelAssetPath: `/pose_landmarker_full.task`, 
            delegate: "GPU" // Usa GPU se disponível
          },
          runningMode: "VIDEO", // Essencial para processamento de vídeo
          numPoses: 1 // Detecta apenas uma pessoa para performance
        });
        setPoseLandmarker(landmarker);
        setLoading(false); // Modelo carregado
        console.log("PoseLandmarker loaded successfully.");
      } catch (err) {
        console.error("Error loading PoseLandmarker:", err);
        setError("Falha ao carregar o modelo de detecção de pose.");
        setLoading(false);
      }
    };
    createPoseLandmarker();

    // Cleanup: Descarrega o modelo se o componente for desmontado (se houver método close)
    // return () => { poseLandmarker?.close(); } // Descomente se 'close' existir
  }, []);

  // 2. Ajusta o tamanho do Canvas quando o vídeo começa a tocar
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const handleVideoPlay = () => {
      if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(`Canvas resized to ${video.videoWidth}x${video.videoHeight}`);
      }
    };

    if (video) {
      video.addEventListener('loadedmetadata', handleVideoPlay); // Usa loadedmetadata que é mais confiável para dimensões
    }

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', handleVideoPlay);
      }
    };
  }, [webcamRunning]); // Roda quando a webcam é ativada/desativada

  // 3. Função para Iniciar/Parar a Webcam e Detecção
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
      // Limpa o canvas ao parar
      const canvasCtx = canvasRef.current?.getContext("2d");
      if(canvasCtx && canvasRef.current){
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setWebcamRunning(false);
      console.log("Webcam stopped.");
    } else {
      // Ativar
      setError(null); // Limpa erros anteriores
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); // Áudio não é necessário
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Espera o vídeo começar a tocar para iniciar a predição
          videoRef.current.onloadedmetadata = () => {
             if (videoRef.current) { // Checagem dupla
              videoRef.current.play();
              setWebcamRunning(true);
              console.log("Webcam started, starting prediction loop.");
              predictWebcam(); // Inicia o loop
            }
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Não foi possível acessar sua câmera. Verifique as permissões do navegador.");
        setWebcamRunning(false); // Garante que o estado reflita a falha
      }
    }
  };

  // 4. Loop de Predição
  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    if (!video || !canvas || !canvasCtx || !poseLandmarker || !webcamRunning) {
        console.log("Prediction loop stopped or dependencies not ready.");
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); // Garante parada
        animationFrameId.current = null;
        return;
    }

    // Garante que o canvas tem o tamanho certo (caso haja redimensionamento dinâmico)
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;


    const startTimeMs = performance.now();
    // Detecta poses no frame atual do vídeo
    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
        // Limpa o canvas
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha os landmarks
        const drawingUtils = new DrawingUtils(canvasCtx);
        for (const landmarks of result.landmarks) {
            drawingUtils.drawLandmarks(landmarks, {
                radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1) // Pontos menores mais distantes
            });
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS); // Desenha as conexões
        }
    });

    // Chama a função novamente no próximo frame
    if (webcamRunning) { // Verifica novamente antes de continuar o loop
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    } else {
       if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
       animationFrameId.current = null;
    }
  };

  // --- Renderização ---

  // Estado de carregamento do modelo
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

        <div className="relative w-full max-w-4xl aspect-video mx-auto mb-6 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Vídeo da Webcam */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-0 left-0 w-full h-full object-cover"
          ></video>
          {/* Canvas para Desenhar os Landmarks */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          ></canvas>
           {/* Mensagem de Câmera Inativa */}
           {!webcamRunning && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white text-xl font-semibold">Câmera inativa</p>
             </div>
           )}
        </div>

        {/* Botão para Ativar/Desativar */}
        <button
          onClick={enableCam}
          disabled={loading} // Desabilita enquanto o modelo carrega
          className={`px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${webcamRunning
              ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
              : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {webcamRunning ? 'Desativar Câmera' : 'Ativar Câmera'}
        </button>

      </div>
    </Layout>
  );
};

