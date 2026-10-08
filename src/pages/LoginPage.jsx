import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateDemoUser } from "../auth.js";

function LoginPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("usuario") ?? "").trim();
    const password = String(formData.get("contrasena") ?? "");
    const result = authenticateDemoUser(username, password);

    if (result === "invalid") {
      setMessage("El usuario o la contraseña no son correctos.");
      return;
    }

    if (result === "storage-error") {
      setMessage("El navegador no permite guardar la sesión de demostración.");
      return;
    }

    navigate("/registro", { replace: true });
  }

  return (
    <main>
      <h1>Iniciar sesión</h1>
      <p>Accede para continuar al registro del examen.</p>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="usuario">Usuario</label><br />
          <input id="usuario" name="usuario" type="text" autoComplete="username" required />
        </p>

        <p>
          <label htmlFor="contrasena">Contraseña</label><br />
          <input id="contrasena" name="contrasena" type="password" autoComplete="current-password" required />
        </p>

        <p role="alert" aria-live="assertive">{message}</p>
        <button type="submit">Entrar</button>
      </form>

      <p>
        Acceso de demostración. Las credenciales están visibles en <code>src/auth.js</code> y no protegen información real.
      </p>
    </main>
  );
}

export default LoginPage;