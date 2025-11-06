import { useEffect, useRef, useState, useCallback } from 'react';

// =========================================================================================
// 1. CONFIGURAÇÃO MEDIAPIPE E DEPENDÊNCIAS
// Nota: Em um ambiente de projeto real, @mediapipe/tasks-vision deve estar instalado.
// Para este exemplo em arquivo único, assumimos que as dependências do CDN estão carregadas.
// =========================================================================================
const MediaPipeCDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
const LandmarkerModel = `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float/1/pose_landmarker_lite.task`;

// @ts-ignore - Assumimos que o CDN injetou estas classes no escopo global (window)
const { FilesetResolver, PoseLandmarker } = window; 

// =========================================================================================
// 2. TIPAGENS E FUNÇÕES AUXILIARES (Lógica de Negócio e UI)
// =========================================================================================

type PostureFeedback = {
  message: string;
  status: 'ideal' | 'warning' | 'error' | 'loading';
};

type TeleconsultaData = {
    id: string;
    patientName: string;
    patientAge: number;
};

/**
 * Simula a lógica de análise de postura baseada em coordenadas de landmarks.
 * @param landmarks As coordenadas da pose detectada pelo MediaPipe.
 */
const analyzePosture = (landmarks: any): PostureFeedback => { 
    if (!landmarks || landmarks.length === 0) {
        return { 
            message: "Aguardando detecção de postura...", 
            status: 'loading' 
        };
    }

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
            message: "Analisando movimento e enquadramento...", 
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
            
            <div className={`p-4 rounded-lg font-semibold text-lg border transition-all duration-300
                ${feedback.status === 'ideal' ? 'bg-green-100 border-green-600 text-green-800' : 'bg-white border-gray-300 text-gray-700'}`}>
                {icon} {feedback.message}
            </div>

            <p className="text-xs text-gray-500 pt-2">O sistema monitora em tempo real a posição do seu corpo.</p>
        </div>
    );
};

// =========================================================================================
// 3. COMPONENTE PRINCIPAL (COM CORREÇÕES DE PERFORMANCE E EXIBIÇÃO)
// =========================================================================================

export function Teleconsulta() {
  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const [feedback, setFeedback] = useState<PostureFeedback>({ message: "Iniciando câmera...", status: 'loading' });
  const [isLandmarkerReady, setIsLandmarkerReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const poseLandmarkerRef = useRef<any | null>(null);
  
  // CORREÇÃO OOM: Flag para controlar o gargalo do MediaPipe
  // Impedindo que novas detecções comecem antes que a anterior termine.
  const requestDetectRef = useRef(false); 

  
  /**
   * Função para desenhar as landmarks no canvas (simulação simplificada da DrawingUtils).
   * @param ctx O contexto 2D do canvas.
   * @param landmarks As landmarks de pose normalizadas.
   */
  const drawResults = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    if (!ctx || !landmarks || landmarks.length === 0) return;
    
    // Configurações de estilo
    ctx.strokeStyle = '#00FFFF'; // Ciano para os conectores
    ctx.fillStyle = '#FF00FF'; // Magenta para os pontos
    ctx.lineWidth = 3; 

    // Conexões de pose (simulação dos principais ossos)
    const connections = [
        [11, 13], [13, 15], [12, 14], [14, 16], // Braços
        [11, 12], [23, 24], // Ombros
        [23, 25], [25, 27], [27, 29], // Perna Esquerda
        [24, 26], [26, 28], [28, 30] // Perna Direita
    ];

    // 1. Desenha as conexões
    ctx.beginPath();
    connections.forEach(([start, end]) => {
        if (landmarks[start] && landmarks[end]) {
            const startX = landmarks[start].x * ctx.canvas.width;
            const startY = landmarks[start].y * ctx.canvas.height;
            const endX = landmarks[end].x * ctx.canvas.width;
            const endY = landmarks[end].y * ctx.canvas.height;
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        }
    });
    ctx.stroke();
    
    // 2. Desenha as landmarks
    landmarks.forEach((landmark) => {
        ctx.beginPath();
        ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

  }, []);


  /**
   * Função de loop de detecção OTIMIZADA.
   * Soluciona o erro Out Of Memory (OOM) e a Tela Preta.
   */
  const detectPosture = useCallback((_timestamp: number) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = poseLandmarkerRef.current;

    // Condição para CORREÇÃO OOM: Se o Landmarker não estiver pronto OU 
    // se o MediaPipe ainda estiver processando o frame anterior, pule a detecção.
    if (!video || !canvas || !landmarker || requestDetectRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectPosture);
        return;
    }

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    
    // Redimensiona o canvas para o tamanho do vídeo (melhora a exibição)
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Define a flag de concorrência para TRUE.
    requestDetectRef.current = true;

    // 1. Chama a detecção assíncrona do MediaPipe
    landmarker.detectForVideo(video, Date.now(), (result: any) => {
        // CORREÇÃO OOM: O MediaPipe terminou de processar. Liberamos a flag.
        requestDetectRef.current = false; 

        // 2. CORREÇÃO TELA PRETA: Limpa e Desenha o vídeo atual no Canvas
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        // Aplica o espelhamento horizontal no Canvas
        canvasCtx.scale(-1, 1);
        // Desenha o vídeo espelhado
        canvasCtx.drawImage(video, 0, 0, -canvas.width, canvas.height);
        canvasCtx.restore();

        let currentLandmarks = null;

        if (result.landmarks && result.landmarks.length > 0) {
            currentLandmarks = result.landmarks[0];
            
            // Desenha as landmarks sobre o vídeo no canvas
            drawResults(canvasCtx, currentLandmarks);
        } 
        
        // 3. Atualiza o feedback da postura
        const newFeedback = analyzePosture(currentLandmarks);
        setFeedback(newFeedback);

        // 4. Solicita o próximo frame para continuar o loop de animação.
        animationFrameRef.current = requestAnimationFrame(detectPosture);
    });

  }, [drawResults]); 


  useEffect(() => {
    // Simulação de carregamento de dados
    const fetchedData: TeleconsultaData = {
      id: 'simulated-id',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);
    
    // ==========================================================
    // 1. Inicializa o MediaPipe e o modelo
    // ==========================================================
    const initializeLandmarker = async () => {
        try {
            if (typeof FilesetResolver === 'undefined' || typeof PoseLandmarker === 'undefined') {
                 setFeedback({ message: "❌ Erro: Biblioteca MediaPipe não carregada.", status: 'error' });
                return;
            }
            
            setFeedback({ message: "Carregando modelo de Pose...", status: 'loading' });

            const filesetResolver = await FilesetResolver.forVisionTasks(
                MediaPipeCDN + "/wasm"
            );
            
            const landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
              baseOptions: {
                modelAssetPath: LandmarkerModel,
                delegate: "GPU" 
              },
              runningMode: "VIDEO",
              numPoses: 1
            });
            
            poseLandmarkerRef.current = landmarker;
            setIsLandmarkerReady(true); // Landmarker pronto
            setFeedback({ message: "Modelo carregado, iniciando câmera...", status: 'loading' });

        } catch (err) {
            console.error("Erro ao inicializar PoseLandmarker:", err);
            setFeedback({ 
                message: "❌ Erro: Falha ao carregar o modelo de Pose.", 
                status: 'error' 
            });
        }
    };
    initializeLandmarker();


    // ==========================================================
    // 2. Inicia a Webcam (Gatilho após Landmarker estar pronto)
    // ==========================================================
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                // OTIMIZAÇÃO: Diminui a resolução para reduzir o consumo de memória (OOM)
                width: { ideal: 640 },
                height: { ideal: 480 },
            }, 
            audio: false // Áudio desabilitado para simplificar, se não for necessário.
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            // Só começa o loop de detecção quando o vídeo estiver carregado
            animationFrameRef.current = requestAnimationFrame(detectPosture); 
            setFeedback({ message: "Aguardando detecção de postura...", status: 'loading' });
          };
        }
      } catch (err) {
        console.error("Erro ao acessar câmera/microfone:", err);
        setFeedback({ 
          message: "❌ Erro: Não foi possível acessar câmera ou microfone.", 
          status: 'error' 
        });
      }
    };
    
    if(isLandmarkerReady) {
        startWebcam();
    }


  }, [isLandmarkerReady, detectPosture]); 


  // ==========================================================
  // 4. Função de Cleanup (Garante a parada do loop e da câmera)
  // ==========================================================
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (poseLandmarkerRef.current && poseLandmarkerRef.current.close) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []); 


  if (!teleconsulta) {
    return (
      <div className="text-center py-12">Carregando informações da teleconsulta...</div>
    );
  }

  const patientFirstName = teleconsulta.patientName.split(' ')[0] || "paciente";

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
      {/* Script do CDN para garantir o carregamento da biblioteca MediaPipe Task Library */}
      <script src={MediaPipeCDN + "/tasks-vision.js"}></script>
      
      <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold text-indigo-800 text-center mb-8 border-b pb-4">
            Teleconsulta: {teleconsulta.patientName} ({teleconsulta.patientAge} anos)
          </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[70vh]">
        
        {/* COLUNA 1: Canvas Visível com o Stream e as Marcações */}
        <div className="lg:flex-2 flex-1 bg-gray-800 rounded-2xl shadow-2xl relative overflow-hidden flex justify-center items-center">
          
          {/* O CANVAS é a CORREÇÃO para a tela preta, ele renderiza o vídeo + landmarks */}
          <canvas 
              ref={canvasRef} 
              className="rounded-2xl w-full h-full object-contain"
          ></canvas>
          
          {/* O VÍDEO fica OCULTO, servindo apenas como a fonte de dados (stream) para o Canvas */}
          <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="hidden" 
          ></video>
          

          {/* Overlay de informação */}
          <div className="absolute bottom-4 left-4 p-2 px-4 bg-indigo-600 bg-opacity-80 text-white rounded-lg font-medium text-sm shadow-lg">
            <p>Sua Posição Monitorada</p>
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
              patientName={patientFirstName}
          />
        </div>
      </div>
    </div>
  );
};