-> Integrantes
- João Pedro Scarpin de Assis Carvalho  RM: 565421
- Gabriel Otavio Wince Souza            RM: 566150
- Wesley Silva de Andrade               RM: 563593

-> Tecnologias usadas no projeto
- Vite
- React
- Typescript
- Tailwind CSS
- React Router DOM
- Media Pipe da Google


-> Imagens, Icones e Video
- joao.jpg
- gabriel.jpg
- wesley.jpg 
- logo.jpg 
- logo.ico
- guia.mp4 

-> Links
- GITHUB: https://github.com/wesley1812/ConecteCare
- Youtube: https://youtu.be/XVgmX2voFbs
- Vercel: https://conecte-care.vercel.app/

A API em Java não foi possível ser integrada ao projeto por complicações durante o deploy no Render. Restrição de requisições por parte da Oracle. 
Caso queira avaliar o funcionamento do site e suas respectivas funções, inicializar o servidor pelo comando npx json-server --watch db.json --port 4000 
Funções de cadastro e login são realizadas pelo db.json 

-> GITHUB JAVA: https://github.com/Scarpin12/ChallengeTDSPXJava

-> Estrutura de pasta

CONECTECARE/
└── ConecteCare/                   
    ├── node_modules/        
    ├── public/             
    │   └── assets/
    │   └── midia/
    │       └── gabriel.jpg
    │       └── guia.mp4
    │       └── joao.jpg
    │       └── logo.jpg
    │       └── wesley.jpg
    │
    ├── src/
    │   ├── api/conecte-care-api.ts                     
    │   ├── components/        
    │   │       └── CardConsulta.jsx
    │   │       └── CardEquipe.jsx
    │   │       └── CardSaude.jsx
    │   │       └── CardsDashboard.jsx
    │   │       └── FormularioCuidador.jsx
    │   │       └── FormularioPaciente.jsx
    │   │       └── FormulariosConsulta.jsx
    │   │       └── Layout.jsx
    │   │       └── Recursos.jsx
    │   │    
    |   ├── context/        
    │   │       └── auth-context.jsx
    │   │       └── cadastro-context.jsx
    │   │       └── consultas-context.jsx
    │   │   
    │   |
    │   ├── pages/             
    │   │   ├── AtualizarPerfilCuidador.jsx       
    │   │   ├── AtualizarPerfilPaciente.jsx       
    │   │   ├── Cadastro.jsx       
    │   │   ├── Contato.jsx       
    │   │   ├── Dashboard.jsx       
    │   │   ├── FAQ.jsx       
    │   │   ├── GuiaUsuario.jsx       
    │   │   ├── Home.jsx
    │   │   └── Login.jsx
    |   |   ├── MinhasConsultas.jsx       
    │   │   ├── NotFound.jsx       
    │   │   ├── PerfilCuidador.jsx
    |   |   ├── PerfilPaciente.jsx       
    │   │   ├── QuemSomos.jsx       
    │   │   ├── Teleconsulta.jsx  
    │   │
    │   ├── types/            
    │   │   ├── auth-user.ts
    │   │   ├── interfaces.ts
    │   │   ├── mocked-data.ts
    │   │   └── useForm.ts
    │   │
    |   ├── routes/            
    │   │   ├── ProtectedRoute.ts
    │   ├── schemas/            
    │   │   ├── forms-consulta-schema.ts
    │   │   └── forms-schema.ts
    │   │   └── login-schema.ts
    |   ├── styles/            
    │   │   ├── icons.ts
    │   ├── App.css   
    │   ├── App.tsx           
    │   ├── index.css           
    │   ├── main.tsx         
    │   └──vite-env.d.ts          
    │
    ├── .gitignore    
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json      
    ├── package.json           
    ├── README.md 
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json    
    └── vite.config.ts
