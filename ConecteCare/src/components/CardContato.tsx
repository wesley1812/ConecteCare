import type { CardContatos } from "../types/interfaces";

export function CardContato ({ info }: CardContatos){
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-3xl mb-4">{info.icon}</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h2>
      <p className="text-gray-700">{info.content}</p>
    </div>
  );
};
