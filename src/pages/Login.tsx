import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");

      await login(email, password);

      const role = localStorage.getItem("role");

      if (role === "admin") navigate("/admin");
      else if (role === "barber") navigate("/barber-panel");
      else navigate("/");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && (
          <p className="text-red-500 mb-3">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>

      </form>
    </div>
  );
}
