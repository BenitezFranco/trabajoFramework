import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
    const router = useRouter();
    const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUsuarioAutenticado(true);
        } else {
            router.push('/login');
            return;
        }
    }, []);

    const handlePerfilClick = () => {
        router.push('/profile');
    };

    const handleCrearRecetaClick = () => {
        router.push('/create-recipe');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow p-6 bg-gray-100">
                <h1 className="text-3xl font-bold mb-4 text-center">Bienvenido a Foodbook</h1>
                <p className="text-lg text-center mb-8">Descubre, crea y comparte deliciosas recetas.</p>

                <div className="flex flex-col items-center space-y-4">
                    {usuarioAutenticado ? (
                        <>
                            <button 
                                onClick={handlePerfilClick} 
                                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
                            >
                                Ir a mi perfil
                            </button>
                            <button 
                                onClick={handleCrearRecetaClick} 
                                className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600"
                            >
                                Crear una nueva receta
                            </button>
                        </>
                    ) : (
                        <p className="text-lg text-center">Inicia sesión para acceder a tu perfil y crear recetas.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
