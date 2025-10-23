import type { TeamMember } from "../types/interfaces";



export const TeamCard = ({ member }: { member: TeamMember }) => {
  const imagePlaceholder = `https://placehold.co/150x150/06B6D4/ffffff?text=${member.name.split(' ')[0][0]}${member.name.split(' ')[1][0]}`;

  const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-blue-700 transition-colors duration-200"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.6c3.2 0 4.9-1.3 4.9-4.3 0-1-.4-2-1-2.7.3-.8.3-2.3 0-3.1 0 0-1.1-.3-3.7 1.3A13.9 13.9 0 0 0 7 7.7c-2.6 1.6-3.7 1.3-3.7 1.3-.3.8-.3 2.3 0 3.1-.6.7-1 1.7-1 2.7 0 3 1.7 4.3 4.9 4.3-.2.2-.4.4-.4.8v4" /></svg>
  );

  const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-cyan-500 transition-colors duration-200"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
  );


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

