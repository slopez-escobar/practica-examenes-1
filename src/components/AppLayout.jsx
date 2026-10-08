import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from "../auth.js";

function AppLayout() {
  const navigate = useNavigate();
  const username = getCurrentUser();

  function handleSignOut() {
    if (signOut()) {
      navigate("/login", { replace: true });
    }
  }

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/examenes">Aula de exámenes</Link>
        <nav aria-label="Navegación principal">
          <NavLink to="/examenes">Explorar</NavLink>
          <NavLink to="/examenes/nuevo">Crear examen</NavLink>
        </nav>
        <div className="account-menu">
          <span>Hola, <strong>{username}</strong></span>
          <button className="button-secondary" type="button" onClick={handleSignOut}>Cerrar sesión</button>
        </div>
      </header>
      <Outlet />
    </>
  );
}

export default AppLayout;
