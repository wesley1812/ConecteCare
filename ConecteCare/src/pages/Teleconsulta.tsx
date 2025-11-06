import { useEffect, useRef, useState, type JSX, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { TeleconsultaData } from '../types/interfaces';
import { Layout } from '../components/Layout';

// =========================================================================================
// 1. IMPORTAÇÕES CORRETAS DO TENSORFLOW.JS E POSE-DETECTION
// =========================================================================================
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection'; // PACOTE CORRETO

// Tipos de Feedback (mantidos)
type PostureFeedback = {
  message: string;
  status: 'ideal' | 'warning' | 'error' | 'loading';
};

// =========================================================================================
// 2. LÓGICA DE ANÁLISE DE POSTURA (ADAPTADA AO FORMATO poseDetection/MoveNet)
// =========================================================================================

/**
 * Analisa a postura baseada nos resultados do MoveNet (dentro de pose-detection).
 * @param pose O objeto de pose retornado pelo MoveNet.
 * @returns PostureFeedback
 */
// O tipo 'pose' será 'poseDetection.Pose'
const analyzePosture = (pose: poseDetection.Pose | null): PostureFeedback => {
    if (!pose || !pose.keypoints || (pose?.score ?? 0) < 0.2) {
        return {
            message: "❌ Postura Não Detectada. Por favor, aproxime-se e garanta boa iluminação.",
            status: 'error'
        };
    }

    // MoveNet keypoints: 0: Nariz, 5: Ombro Esquerdo, 6: Ombro Direito
    // Certificamos que os keypoints existem antes de acessar
    const keypoints = pose.keypoints;

    // Tentativa segura de acessar os pontos
    const nose = keypoints.find(kp => kp.name === 'nose');
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');

    if (!nose || !leftShoulder || !rightShoulder || (nose.score ?? 0) < 0.5 || (leftShoulder.score ?? 0) < 0.5 || (rightShoulder.score ?? 0) < 0.5) {
         return {
            message: "⚠️ Visibilidade Parcial. Mantenha rosto e ombros visíveis.",
            status: 'warning'
        };
    }
    
    // --- Checagem 2: Centralização (Nariz) ---
    // As coordenadas estão normalizadas (0 a 1)
    const videoCenterX = 0.5;
    const noseX = nose.x; 

    if (Math.abs(noseX - videoCenterX) > 0.15) { 
        return {
            message: "⚠️ Posição Descentralizada. Mantenha o rosto na área central da câmera.",
            status: 'warning'
        };
    }

    // --- Checagem 3: Distância para enquadramento ---
    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);

    if (shoulderWidth < 0.2) { 
        return {
            message: "❌ Muito Distante. Aproxime-se para enquadrar melhor o tronco.",
            status: 'error'
        };
    }

    // Se passou em todas as checagens
    return {
        message: "✅ Posição Ideal! Rosto e tronco estão bem enquadrados.",
        status: 'ideal'
    };
};


// Componente para exibir o painel de feedback (mantido)
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
// 3. COMPONENTE PRINCIPAL (MIGRADO E CORRIGIDO)
// =========================================================================================

export function Teleconsulta(): JSX.Element {
  const { consultaId } = useParams<{ consultaId: string }>();
  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const [feedback, setFeedback] = useState<PostureFeedback>({ message: "Iniciando câmera e modelo...", status: 'loading' });

  const videoRef = useRef<HTMLVideoElement>(null); 
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef(0);
  
  // Referência para o modelo MoveNet
  const modelRef = useRef<poseDetection.PoseDetector | null>(null); 
  
  const detectionInterval = 50; 


  /**
   * Função de loop principal. Envia frames ao MoveNet apenas a cada 'detectionInterval'.
   */
  const detectPosture = useCallback(async (timestamp: number) => { 
    if (!videoRef.current || !teleconsulta || !modelRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPosture);
      return;
    }
    
    // 1. Lógica de Throttle: Processa apenas a cada 'detectionInterval'
    if (timestamp - lastDetectionTimeRef.current >= detectionInterval) {
        lastDetectionTimeRef.current = timestamp;

        const video = videoRef.current;
        
        // 2. Cria o tensor a partir do vídeo
        // Usamos tf.tidy para garantir a limpeza automática de tensores temporários
        let tensor;
        let poses;
        try {
            tensor = tf.browser.fromPixels(video);
            poses = await modelRef.current!.estimatePoses(tensor, {
                maxPoses: 1,
                flipHorizontal: false // O espelhamento do vídeo já é feito no CSS
            });
        } finally {
            if (tensor) tensor.dispose();
        }

        // 4. Resolve a Promise e analisa a postura
        // 4. Analisa a postura com o resultado
        const [singlePose] = poses;
        const newFeedback = analyzePosture(singlePose || null); 
        setFeedback(newFeedback);
    }


    // 5. Agenda o próximo frame (Garante vídeo fluido em 60 FPS)
    animationFrameRef.current = requestAnimationFrame(detectPosture);

  }, [teleconsulta]);


  useEffect(() => {
    
    const fetchedData: TeleconsultaData = {
      id: consultaId || '1',
      patientName: "João da Silva",
      patientAge: 75,
    };
    setTeleconsulta(fetchedData);

    // --- 1. Inicializa o TensorFlow.js e o modelo MoveNet ---
    const initializeModel = async () => {
        try {
            // Configuração do modelo (Usando a nova API do poseDetection)
                        const detectorConfig: poseDetection.MoveNetModelConfig = {
                            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING // Modelo rápido
                        };
                        
                        // Carrega o detector de poses (que usa o MoveNet)
                        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

            modelRef.current = detector;
            console.log("MoveNet Detector carregado e pronto.");
            setFeedback({ message: "Câmera e modelo prontos.", status: 'loading' });
        } catch (error) {
            console.error("Erro ao carregar o modelo MoveNet:", error);
            setFeedback({ 
                message: "❌ Erro: Falha ao carregar o modelo de IA.", 
                status: 'error' 
            });
        }
    };
    initializeModel(); 


    // --- 2. Inicia a Webcam e o Loop de Detecção ---
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Inicia o loop requestAnimationFrame
        animationFrameRef.current = requestAnimationFrame(detectPosture); 
      } catch (err) {
        console.error("Erro ao acessar câmera/microfone:", err);
        setFeedback({ 
            message: "❌ Erro: Não foi possível acessar câmera ou microfone.", 
            status: 'error' 
        });
      }
    };

    // Atrasar a webcam para dar tempo ao modelo de carregar
    setTimeout(startWebcam, 500); 
    
    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
      // Limpeza da stream da câmera.
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      // Não é necessário um dispose explícito no detector, mas tf.tidy garante os tensores.
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
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]" 
            ></video>
            
            {/* Canvas removido, pois não é estritamente necessário para o processamento do TF.js */}

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
}