import {Layout} from '../components/Layout';

export function GuiaDoUsuario() {
  const videoUrl = "/assets/midia/guia.mp4";

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
            Guia de Acessibilidade
          </h1>
          <p className="text-center text-lg text-gray-700 mb-12">
            Boas vindas à ConecteCare! Assista ao vídeo abaixo para entender como nossa plataforma funciona. Ele foi criado para que você possa usar o site de forma simples e intuitiva.
          </p>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Como Usar a Plataforma ConecteCare
            </h2>
            <div className="aspect-w-16 aspect-h-9">
              <video
                className="w-full h-auto rounded-lg"
                controls
                autoPlay
                muted
              >
                <source src={videoUrl} type="video/mp4" />
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
