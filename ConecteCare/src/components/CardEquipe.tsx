import type { TeamCardProps } from "../types/interfaces";

export function TeamCard({ member }: TeamCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl overflow-hidden">
        {member.image ? (
          <img 
            src={member.image} 
            alt={`Foto de ${member.name}`} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-gray-500">👤</span>
        )}
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h2>
      <p className="text-gray-600 mb-4">RM: {member.rm} | Turma: {member.turma}</p>
      <div className="flex justify-center space-x-4">
        <a
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          GitHub
        </a>
        <span className="text-gray-400">|</span>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
};
