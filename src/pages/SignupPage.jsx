import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../auth.js";

function SignupPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const result = createUser(
      String(formData.get("usuario") ?? ""),
      String(formData.get("contrasena") ?? "")
    );

    if (result === "exists") {
      setMessage("Ese nombre de usuario ya está registrado.");
    } else if (result === "storage-error") {
      setMessage("No se pudo guardar la cuenta en este navegador.");
    } else if (result === "invalid") {
      setMessage("Escribe un usuario y una contraseña.");
    } else {
      navigate("/examenes", { replace: true });
    }
  }

  return (
    <main className="auth-card">
      <p className="eyebrow">Exámenes compartidos</p>
      <h1>Crear cuenta</h1>
      <p>Regístrate para crear exámenes y consultar los resultados de tus formularios.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre de usuario
          <input name="usuario" autoComplete="username" minLength="2" maxLength="40" required />
        </label>
        <label>
          Contraseña
          <input name="contrasena" type="password" autoComplete="new-password" minLength="6" required />
        </label>
        <p className="form-message" role="alert">{message}</p>
        <button type="submit">Crear cuenta</button>
      </form>
      <p className="muted">Demo local: las cuentas se guardan solo en este navegador y no son adecuadas para información real.</p>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </main>
  );
}

export default SignupPage;
