import {Layout} from '../components/Layout';

const AspectRatioBox = ({ children }: { children: React.ReactNode }) => (
    <div className="relative w-full" style={{ paddingTop: "56.25%" /* 16:9 Aspect Ratio */ }}>
        <div className="absolute inset-0">
            {children}
        </div>
    </div>
);

export function GuiaDoUsuario() {
  const videoUrl = "/assets/midia/guia.mp4"; 

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pb-16">
        
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white py-16 sm:py-20 shadow-xl">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-white uppercase tracking-widest text-lg font-bold">Inicie sua Jornada</span>
                <h1 className="text-5xl sm:text-6xl font-black mt-2 tracking-tighter">
                    Guia do Usuário
                </h1>
                <p className="mt-4 text-xl text-cyan-100 max-w-3xl mx-auto">
                    Boas vindas à ConecteCare! Assista ao tutorial abaixo para dominar o uso da nossa plataforma de telemedicina.
                </p>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-3xl border border-gray-100 transition-all duration-300">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Tutorial em Vídeo: Como Usar
            </h2>
            
            <AspectRatioBox>
              <video
                className="w-full h-full rounded-2xl shadow-xl border-4 border-cyan-400/50 object-cover"
                controls
              >
                <source src={videoUrl} type="video/mp4" />
                Seu navegador não suporta a tag de vídeo.
              </video>
            </AspectRatioBox>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-lg text-gray-700 font-medium">
                    <span className="text-blue-600 font-bold mr-1">Dica:</span>
                    Certifique-se de que sua conexão com a internet esteja estável para uma visualização sem interrupções.
                </p>
            </div>

          </div>
        </div>
        
      </div>
    </Layout>
  );
}
