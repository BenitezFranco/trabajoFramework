import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Image from 'next/image';

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
                    const response = await fetch(`http://localhost:1337/api/recetas/${id}?populate[foto_receta]=*&populate[author]=*&populate[categorias]=*`, {
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
            <div className='w3-main w3-content w3-padding" style="max-width:1200px;margin-top:100px'>
            <div className="w3-container w3-padding-32 w3-center">
                <h1 className="text-3xl font-bold mb-4">{receta.data.titulo}</h1>
                {fotoUrl ? (
                    <Image src={`http://localhost:1337/${fotoUrl}`} alt={`Imagen de ${receta.data.titulo}`} width={400} height={266} className="w-full h-full object-cover mb-4" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 mb-4">
                        <span className="text-gray-500">{receta.data.titulo}</span>
                    </div>
                )}
                <div className="w3-padding-32">
                    <h4 className="text-2xl font-bold mb-2">Descripción:</h4>
                    <p className="text-lg font-medium mb-2">{receta.data.descripcion}</p>
                    <h4 className="text-2xl font-bold mb-2">Instrucciones:</h4>
                    <p className="text-lg font-medium mb-2">{receta.data.instrucciones}</p>
                    <h4 className="text-2xl font-bold mb-2">Ingredientes:</h4>
                    <p className="text-lg font-medium mb-2">{receta.data.ingredientes}</p>
                    <h4 className="text-2xl font-bold mb-2">Dificultad:</h4>
                    <p className="text-lg font-medium mb-2">{receta.data.dificultad}</p>
                    <h4 className="text-2xl font-bold mb-2">Tiempo de Preparación:</h4>
                    <p className="text-lg font-medium mb-2">{receta.data.tiempo_preparacion} minutos</p>
                    <h4 className="text-2xl font-bold mb-2">Fecha de Publicación:</h4>
                    <p className="text-lg font-medium mb-2">{new Date(receta.data.fecha_publicacion).toLocaleDateString()}</p>
                    <h4 className="text-2xl font-bold mb-2">Autor:</h4>
                    <p className="text-lg font-medium mb-2">{receta.data.author.username}</p>
                    {receta.data.categorias.map((item) =>
                    <span className="inline-block px-4 py-2 rounded-md border  hover:bg-blue-400 transition">{item.nombre}</span>
                    )
                    }
                </div>
                <button 
                    onClick={() => router.back()} 
                    className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Volver
                </button>
            </div>
            </div>
            <Footer />
        </div>
    );    
};

export default RecipePage;
