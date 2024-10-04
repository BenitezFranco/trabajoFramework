import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';

const RecipePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [receta, setReceta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchReceta = async () => {
                const token = localStorage.getItem('token'); 
                if (!token) {
                    alert('Debes iniciar sesión para ver esta receta');
                    router.push('/login'); 
                    return;
                }
    
                try {
                    const response = await fetch(`http://localhost:1337/api/recetas/${id}?populate=foto_receta`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}` 
                        }
                    });
    
                    if (response.status === 403 || response.status === 401) {
                        
                        alert('No tienes acceso para ver esta receta');
                        router.push('/login');
                    } else {
                        const data = await response.json();
                        console.log('Datos recibidos del backend:', data);
                        setReceta(data);
                    }
                } catch (error) {
                    console.error('Error al obtener la receta:', error);
                } finally {
                    setLoading(false);
                }
            };
    
            fetchReceta();
        }
    }, [id]);
    
    useEffect(() => {
        console.log('Receta actualizada: ', receta);
    }, [receta]);
    
    if (loading) {
        return <p className="text-center text-lg">Cargando receta...</p>;
    }
    
    if (!receta) {
        return <p className="text-center text-lg text-red-500">Receta no encontrada</p>;
    }
    
    let fotoUrl= null;
    if(receta.data.foto_receta){
        fotoUrl = receta.data.foto_receta.url;
    }

    return (
        <div>
            <Header></Header>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-4">{receta.data.titulo}</h1>
                {fotoUrl ? (
          <img src={`http://localhost:1337/${fotoUrl}`} alt={`Imagen de ${receta.data.titulo}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">{receta.data.titulo}</span>
          </div>
        )}
                <p className="text-lg font-medium mb-2"><strong>Descripción:</strong> {receta.data.descripcion}</p>
                <p className="text-lg font-medium mb-2"><strong>Instrucciones:</strong> {receta.data.instrucciones}</p>
                <p className="text-lg font-medium mb-2"><strong>Ingredientes:</strong> {receta.data.ingredientes}</p>
                <p className="text-lg font-medium mb-2"><strong>Dificultad:</strong> {receta.data.dificultad}</p>
                <p className="text-lg font-medium mb-2"><strong>Tiempo de Preparación:</strong> {receta.data.tiempo_preparacion} minutos</p>
                <p className="text-lg font-medium mb-2"><strong>Fecha de Publicación:</strong> {new Date(receta.data.fecha_publicacion).toLocaleDateString()}</p>
                <p className="text-lg font-medium mb-4"><strong>Autor:</strong> {receta.data.nombre_usuario}</p>
    
                <button 
                    onClick={() => router.back()} 
                    className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Volver
                </button>
            </div>
        </div>
        <Footer></Footer>
        </div>
    );    
};

export default RecipePage;
