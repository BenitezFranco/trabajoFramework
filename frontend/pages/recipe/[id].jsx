import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Image from 'next/image'; // Asegúrate de importar Image

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
    
    let fotoUrl = null;
    if (receta.data.foto_receta) {
        fotoUrl = receta.data.foto_receta.url;
    }

    return (
        <div>
            <Header />
            <div className="w3-container w3-padding-32 w3-center bg-gray-100">
                <h1 className="text-3xl font-bold mb-4">{receta.data.titulo}</h1>
                {fotoUrl ? (
                    <Image src={`http://localhost:1337/${fotoUrl}`} alt={`Imagen de ${receta.data.titulo}`} width={800} height={533} className="w-full h-full object-cover mb-4" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 mb-4">
                        <span className="text-gray-500">{receta.data.titulo}</span>
                    </div>
                )}
                <div className="w3-padding-32">
                    <h4><b>Descripción:</b></h4>
                    <p className="text-lg font-medium mb-2">{receta.data.descripcion}</p>
                    <h4><b>Instrucciones:</b></h4>
                    <p className="text-lg font-medium mb-2">{receta.data.instrucciones}</p>
                    <h4><b>Ingredientes:</b></h4>
                    <p className="text-lg font-medium mb-2">{receta.data.ingredientes}</p>
                    <h4><b>Dificultad:</b></h4>
                    <p className="text-lg font-medium mb-2">{receta.data.dificultad}</p>
                    <h4><b>Tiempo de Preparación:</b></h4>
                    <p className="text-lg font-medium mb-2">{receta.data.tiempo_preparacion} minutos</p>
                    <h4><b>Fecha de Publicación:</b></h4>
                    <p className="text-lg font-medium mb-2">{new Date(receta.data.fecha_publicacion).toLocaleDateString()}</p>
                </div>
                <button 
                    onClick={() => router.back()} 
                    className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Volver
                </button>
            </div>
            <Footer />
        </div>
    );    
};

export default RecipePage;
