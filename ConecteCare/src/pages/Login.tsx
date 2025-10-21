import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {Layout} from "../components/Layout";

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim()) {
      login(username);
    }
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-50 flex flex-col flex-1 justify-center items-center">
        <div className="max-w-sm mx-auto p-4 bg-white shadow rounded">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Login</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="text"
              placeholder="Digite seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}