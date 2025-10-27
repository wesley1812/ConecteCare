import { GithubIcon, LinkedinIcon } from "../types/icons";
import type { TeamMember } from "../types/interfaces";


export const TeamCard = ({ member }: { member: TeamMember }) => {
  const imagePlaceholder = `https://placehold.co/150x150/06B6D4/ffffff?text=${member.name.split(' ')[0][0]}${member.name.split(' ')[1][0]}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-8 text-center border border-gray-100">
      <div className="mx-auto w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-cyan-400/50 shadow-md">
        <img
          src={imagePlaceholder}
          alt={`Foto de perfil de ${member.name}`}
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="text-xl font-extrabold text-gray-900 mb-1">{member.name}</h3>
      <p className="text-sm text-cyan-600 font-semibold mb-3">{member.turma} | RM: {member.rm}</p>

      <div className="mt-4 flex justify-center space-x-4">
        <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub de ${member.name}`} className="p-2">
          <GithubIcon />
        </a>
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${member.name}`} className="p-2">
          <LinkedinIcon />
        </a>
      </div>
    </div>
  );
};

