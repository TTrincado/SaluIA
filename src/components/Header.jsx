import { useEffect, useState } from "react";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("saluia.session");
    if (sessionStr) {
      setIsAuthenticated(!!sessionStr);
      try {
        const parsedSession = JSON.parse(sessionStr);
        setUserRole(parsedSession.user?.user_metadata?.role || null);
      } catch (e) {
        console.error("Error parsing session", e);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("saluia.session");
    window.location.href = "/auth/login";
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <header className="border-b border-health-border bg-gray-50 backdrop-blur relative z-40 shadow-md">
        <div className="mx-auto w-full xl:max-w-6xl px-4 py-5 flex items-center gap-4">
          <img src="/logo.png" alt="SaluIA" className="w-36"/>
          <h1 className="font-semibold tracking-wide text-health-secondary text-2xl">SaluIA</h1>

          <nav className="ml-auto flex gap-4 text-md text-health-text">
            <a
              href="/"
              className="hover:text-health-accent transition-colors font-medium"
            >
              Inicio
            </a>
            {userRole === "admin" && (
            <a
              href="/aseguradora"
              className="hover:text-health-accent transition-colors font-medium"
            >
              Aseguradoras
            </a>
            )}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="hover:text-red-600 transition-colors text-left cursor-pointer font-medium"
            >
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-health-border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-health-text mb-2">
              ¿Cerrar sesión?
            </h3>
            <p className="text-health-text-muted text-sm mb-6">
              Serás redirigido al inicio de sesión.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-health-text-muted hover:text-health-text transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-all"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
