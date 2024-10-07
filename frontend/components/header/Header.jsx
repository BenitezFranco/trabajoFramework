import Link from 'next/link';
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  const sidebarRef = useRef(null); // Ref para el sidebar

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const w3_open = () => setSidebarOpen(true);
  const w3_close = () => setSidebarOpen(false);

  // Manejar clics fuera del sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
        w3_close();
      }
    };

    // Agregar el evento de clic al documento
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Limpiar el evento al desmontar
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="pb-20">
      <Head>
        <title>FoodBook</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma" />
        <style>{`
          body,h1,h2,h3,h4,h5,h6 {font-family: "Karma", sans-serif}
          .w3-bar-block .w3-bar-item {padding:20px}
        `}</style>
      </Head>

      {/* Sidebar */}
      <nav
        ref={sidebarRef} // Asignar el ref al sidebar
        className={`w3-sidebar w3-bar-block w3-card w3-top w3-xlarge w3-animate-left ${
          sidebarOpen ? '' : 'w3-hide'
        }`}
        style={{
          zIndex: 4, // Aumentamos el z-index para que esté por encima del top menu
          width: '40%',
          minWidth: '300px',
          position: 'fixed', // Aseguramos que sea fijo
          top: 0, // Fijado en la parte superior
          left: 0, // Fijado en la parte izquierda
        }}
      >
        <Link href="/profile">
          <div onClick={w3_close} className="w3-bar-item w3-button">
            Ir a mi perfil
          </div>
        </Link>
        <Link href="/create-recipe">
          <div onClick={w3_close} className="w3-bar-item w3-button">
            Crear una nueva receta
          </div>
        </Link>
        <Link href="/search">
          <div onClick={w3_close} className="w3-bar-item w3-button">
            Buscador Avanzado
          </div>
        </Link>
        <button onClick={w3_close} className="w3-bar-item w3-button">
          Cerrar menú
        </button>
      </nav>

      {/* Top menu */}
      <div className="w3-top" style={{ zIndex: 3, width: '100%', position: 'fixed', top: 0, left: 0 }}>
        <div
          className="w3-white w3-xlarge"
          style={{
            width: '100%', // Ahora ocupa todo el ancho
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px', // Espaciado lateral
          }}
        >
          <button
            className="w3-button w3-padding-16"
            onClick={w3_open}
            style={{ marginRight: 'auto' }}
          >
            ☰
          </button>
          <Link href="/HomeLog">
            <div className="w3-center" style={{ cursor: 'pointer' }}>
              FoodBook
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 rounded"
            style={{
              padding: '8px 16px', // Ajuste de padding
              fontSize: '14px', // Tamaño de fuente más pequeño
              lineHeight: '20px', // Altura de texto compacta
              marginLeft: 'auto',
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
