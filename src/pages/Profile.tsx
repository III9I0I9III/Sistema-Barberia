import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";

export default function ProfilePage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await apiService.updateProfile(name, phone);
      updateProfile({ name, phone });
      setMessage("Perfil actualizado correctamente");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword(currentPassword, newPassword);
      setMessage("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("¿Seguro que quieres eliminar tu cuenta?")) return;
    try {
      await deleteAccount();
      logout();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <div className="mb-4">
        <label className="block mb-1">Nombre:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Teléfono:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button onClick={handleUpdateProfile} className="bg-blue-600 text-white p-2 rounded mb-4 w-full">
        Actualizar Perfil
      </button>

      <h3 className="text-xl font-bold mb-2">Cambiar Contraseña</h3>
      <input
        type="password"
        placeholder="Contraseña actual"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <button onClick={handleChangePassword} className="bg-green-600 text-white p-2 rounded mb-4 w-full">
        Cambiar Contraseña
      </button>

      <button onClick={handleDeleteAccount} className="bg-red-600 text-white p-2 rounded w-full">
        Eliminar Cuenta
      </button>
    </div>
  );
}
