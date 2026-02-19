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
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white shadow-md rounded-xl"
      >
        <h2 className="mb-4 text-2xl font-bold">Login</h2>

        {error && <p className="mb-3 text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <button type="submit" className="w-full p-2 text-white bg-black rounded">
          Login
        </button>
      </form>
    </div>
  );
}