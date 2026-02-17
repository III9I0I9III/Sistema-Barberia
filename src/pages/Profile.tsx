import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Trash2, Edit3, Save, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../index.css';

export const Profile: React.FC = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = () => {
    updateProfile({ name, phone });
    setIsEditing(false);
    setMessage('Perfil actualizado exitosamente');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Contraseña cambiada exitosamente');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      await deleteAccount();
    }
  };

  if (!user) {
    return (
      <div className="profile-empty">
        <p>Por favor inicia sesión para ver tu perfil</p>
      </div>
    );
  }

  return (
    <div className="profile-container">

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User className="icon-large" />
          </div>
          <div>
            <h1>{user.name}</h1>
            <p className="role">
              {user.role === 'client' && 'Cliente'}
              {user.role === 'barber' && 'Barbero'}
              {user.role === 'admin' && 'Administrador'}
            </p>
          </div>
        </div>

        <div className="profile-body">

          {message && (
            <div className="success-box">
              <Check className="icon-small" />
              {message}
            </div>
          )}

          <div className="section">
            <h2>Información Personal</h2>

            {isEditing ? (
              <div className="form-section">
                <div>
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="btn-row">
                  <button onClick={handleUpdateProfile} className="btn-primary">
                    <Save className="icon-small" />
                    <span>Guardar</span>
                  </button>

                  <button onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-section">

                <div className="info-row">
                  <User className="icon-small gray" />
                  <div>
                    <p className="label">Nombre</p>
                    <p className="value">{user.name}</p>
                  </div>
                </div>

                <div className="info-row">
                  <Mail className="icon-small gray" />
                  <div>
                    <p className="label">Correo Electrónico</p>
                    <p className="value">{user.email}</p>
                  </div>
                </div>

                <div className="info-row">
                  <Phone className="icon-small gray" />
                  <div>
                    <p className="label">Teléfono</p>
                    <p className="value">{user.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  <Edit3 className="icon-small" />
                  <span>Editar Perfil</span>
                </button>

              </div>
            )}
          </div>

        </div>
      </div>

      <div className="profile-card">
        <div className="profile-body">
          <div className="password-header">
            <h2>Cambiar Contraseña</h2>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)} className="edit-btn">
                Cambiar
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="form-section">

              {error && (
                <div className="error-box">
                  <AlertCircle className="icon-small" />
                  {error}
                </div>
              )}

              <div>
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              <div className="btn-row">
                <button type="submit" className="btn-primary">
                  <Lock className="icon-small" />
                  <span>Cambiar Contraseña</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setError('');
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>

            </form>
          )}
        </div>
      </div>

      <div className="delete-card">
        <div>
          <h2>Eliminar Cuenta</h2>
          <p>Elimina permanentemente tu cuenta y todos tus datos</p>
        </div>

        <button onClick={handleDeleteAccount} className="btn-danger">
          <Trash2 className="icon-small" />
          <span>Eliminar Cuenta</span>
        </button>
      </div>

    </div>
  );
};
