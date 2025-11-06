import { useEffect, useRef, useState, type JSX, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { TeleconsultaData } from '../types/interfaces';
import { Layout } from '../components/Layout';

// =========================================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO SIMULADA DO MEDIAPIPE
// Nota: Você deve descomentar as 3 linhas abaixo DEPOIS de instalar @mediapipe/tasks-vision.
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
// =========================================================================================

// Tipos de Feedback para o usuário
type PostureFeedback = {
  message: string;
  status: 'ideal' | 'warning' | 'error' | 'loading';
};

// =========================================================================================
// 2. LÓGICA DE ANÁLISE DE POSTURA (SIMULADA)
// =========================================================================================

/**
 * Simula a lógica de análise de postura baseada em coordenadas de landmarks.
 */
// O parâmetro 'landmarks' é mantido para quando o MediaPipe for integrado.
const analyzePosture = (_landmarks: any): PostureFeedback => { 
    // --- Lógica de detecção de postura (simulação por tempo) ---
    
    const now = new Date().getTime();
    if (now % 20000 < 5000) { 
        return { 
            message: "✅ Posição Ideal! Rosto e tronco bem enquadrados.", 
            status: 'ideal' 
        };
    } else if (now % 20000 < 10000) {
        return { 
            message: "⚠️ Por favor, afaste-se um pouco mais para enquadrar o corpo superior.", 
            status: 'warning' 
        };
    } else if (now % 20000 < 15000) {
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
            
            <div className={`p-4 rounded-lg font-semibold text-lg border ${feedback.status === 'ideal' ? 'bg-green-100 border-green-600 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}>
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
  const [feedback, setFeedback] = useState<PostureFeedback>({ message: "Iniciando câmera...", status: 'loading' });

  const videoRef = useRef<HTMLVideoElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null); // Real MediaPipe

  /**
   * Função de loop para detecção de postura.
   * Aceita o parâmetro de tempo do requestAnimationFrame.
   */
  const detectPosture = useCallback((_timestamp: number) => { // TS agora entende o 'timestamp'
    if (!videoRef.current || !canvasRef.current || !teleconsulta) {
      animationFrameRef.current = requestAnimationFrame(detectPosture);
      return;
    }

    const video = videoRef.current;
    
    // --- Lógica de Processamento (MediaPipe) ---
    if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.detectForVideo(video, Date.now(), (result) => {
            if (result.landmarks && result.landmarks.length > 0) {
                const newFeedback = analyzePosture(result.landmarks[0]);
                setFeedback(newFeedback);
            }
        });
    }
    
    // --- Simulação da lógica de análise ---
    const newFeedback = analyzePosture(null); 
    setFeedback(newFeedback);


    // Continua o loop no próximo frame
    animationFrameRef.current = requestAnimationFrame(detectPosture);

  }, [teleconsulta]);


  useEffect(() => {
    
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    // --- 1. Inicializa o MediaPipe e o modelo (em um ambiente real) ---
    const initializeLandmarker = async () => {
        // Para resolver o TS2339 (Property 'create' does not exist...),
        // você precisa garantir que o tipo 'PoseLandmarker' esteja importado 
        // ou usar uma checagem de objeto global, o que é mais complexo.
        // A maneira mais limpa é **descomentar a linha de importação** após a instalação.

        const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        // Se a importação estiver descomentada, o erro TS2339 desaparece.
        // Use o método factory exposto pela biblioteca em vez de chamar o construtor privado.
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        console.log("PoseLandmarker inicializado.");
    };
    initializeLandmarker(); // Deixe esta linha comentada até que o MediaPipe seja configurado

    // --- 2. Inicia a Webcam e o Loop de Detecção ---
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Uma vez que o stream começa, inicia o loop de detecção
        animationFrameRef.current = requestAnimationFrame(detectPosture); 
      } catch (err) {
        console.error("Erro ao acessar câmera/microfone:", err);
        setFeedback({ 
            message: "❌ Erro: Não foi possível acessar câmera ou microfone.", 
            status: 'error' 
        });
      }
    };

    startWebcam();
    
    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };

  }, [consultaId, detectPosture]); 

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

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[70vh]">
          
          {/* COLUNA 1: Tela de Vídeo */}
          <div className="lg:flex-2 flex-1 bg-gray-800 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Tag de Vídeo (Recebe o stream da webcam) */}
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]" 
            ></video>
            
            {/* Canvas Oculto (Usado pelo MediaPipe para processamento) */}
            <canvas ref={canvasRef} className="hidden"></canvas> 

            {/* Overlay com informação básica */}
            <div className="absolute bottom-4 left-4 p-2 px-4 bg-indigo-600 bg-opacity-80 text-white rounded-lg font-medium text-sm shadow-lg">
              <p>Sua Câmera Ativa</p>
            </div>
            
             {/* Feedback flutuante em caso de erro/loading */}
             {(feedback.status === 'error' || feedback.status === 'loading') && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-black bg-opacity-70 text-white rounded-lg text-center shadow-2xl">
                    <p className="font-semibold">{feedback.message}</p>
                </div>
            )}
          </div>

          {/* COLUNA 2: Painel de Feedback e Orientação */}
          <div className="lg:flex-1 w-full lg:w-1/3">
            <FeedbackPanel 
                feedback={feedback} 
                patientName={teleconsulta.patientName.split(' ')[0] || "paciente"}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};