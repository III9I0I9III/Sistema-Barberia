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
    <div>
      <h2>Mi Perfil</h2>

      {message && <p>{message}</p>}

      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label>Teléfono:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <button onClick={handleUpdateProfile}>
        Actualizar Perfil
      </button>

      <h3>Cambiar Contraseña</h3>

      <input
        type="password"
        placeholder="Contraseña actual"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button onClick={handleChangePassword}>
        Cambiar Contraseña
      </button>

      <button onClick={handleDeleteAccount}>
        Eliminar Cuenta
      </button>
    </div>
  );
}