import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

const CreateRecipe = () => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        instrucciones: '',
        ingredientes: '',
        dificultad: 'Fácil',
        tiempo_preparacion: '',
        categorias: [],
    });
    const router = useRouter();
    const [id_usuario, setIdUsuario] = useState(null);
    const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
    const [fotoReceta, setFotoReceta] = useState(null); // Estado para la foto de la receta
    const [isLoading, setIsLoading] = useState(false);

    // Definimos aquí las categorías con sus índices
    const categoriasData = [
        'Vegetariano',
        'Vegano',
        'Desayuno',
        'Sin TACC',
        'Sin gluten',
        'Postres',
        'Saludables',
        'Cenas',
        'Almuerzos',
        'Platos principales',
        'Aperitivos',
        'Bebidas',
        'Dulces',
        'Ensaladas',
        'Sopas y cremas',
    ];
    const [categoriaElegidas, setCatEleg] = useState({
        categorias: [],
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = jwt.decode(token);
                setIdUsuario(decodedToken.id);
            }
            if (!token) {
                console.log('No token, redirecting to /login');
                router.push('/login');
                return;
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "tiempo_preparacion") {
            setFormData({ ...formData, [name]: parseInt(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCheckboxChange = async (e, categoriaIndex) => {
        const { checked } = e.target;

        const token = localStorage.getItem('token');
        const fetchCategoriaId = async (categoriaIndex) => {
            try {
                const response = await fetch(`http://localhost:1337/api/categorias?filters[id_categoria][$eq]=${categoriaIndex + 1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                const data = await response.json();

                console.log(data);
                console.log("Data Length", data.data.length);
                if (data && data.data.length > 0) {
                    console.log("id ", data.data[0].id);
                    return data.data[0].id; // Retorna el id que Strapi necesita
                } else {
                    return null; // Si no encuentra, retorna null
                }
            } catch (error) {
                console.error("Error al obtener el ID de la categoría", error);
                return null;
            }
        };

        const categoriaId = await fetchCategoriaId(categoriaIndex);

        if (checked) {
            setFormData({
                ...formData,
                categorias: [...formData.categorias, categoriaId],
            });
            setCatEleg({
                ...categoriaElegidas,
                categorias: [...categoriaElegidas.categorias, categoriaIndex + 1], // Agregar el índice + 1
            });
        } else {
            setFormData({
                ...formData,
                categorias: formData.categorias.filter((cat) => cat !== categoriaId),
            });
            setCatEleg({
                ...categoriaElegidas,
                categorias: categoriaElegidas.categorias.filter((cat) => cat !== categoriaIndex + 1), // Remover el índice + 1
            });
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFotoReceta(file);
        console.log(file);
    };

async function uploadImage(fotoReceta, token) {
    const formDataToSend = new FormData();
    formDataToSend.append('files', fotoReceta);

    try {
        const response = await fetch('http://localhost:1337/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formDataToSend,
        });

        if (!response.ok) {
            const responseData = await response.json();
            console.error('Error al subir la imagen:', responseData.error);
            return null;  // Devuelve null si la subida falla
        }

        const responseData = await response.json();
        console.log('Imagen subida correctamente:', responseData);
        return responseData[0];  // Devuelve el primer archivo subido (puedes tener múltiples)
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        return null;  // Devuelve null si ocurre un error
    }
}

async function assignImageToReceta(recetaId, imageId, token) {
    const data = {
        foto_receta: imageId  // Asigna el ID de la imagen al campo de la receta
    };
    console.log(recetaId);
    try {
        const response = await fetch(`http://localhost:1337/api/recetas/${recetaId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),  // Asegúrate de enviar el cuerpo en el formato correcto
        });

        if (!response.ok) {
            const responseData = await response.json();
            console.error('Error al asignar la imagen:', responseData.error);
            return null;
        }

        const responseData = await response.json();
        console.log('Imagen asignada correctamente a la receta:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error al asignar la imagen a la receta:', error);
        return null;
    }
}


    async function uploadAndAssignImage(recetaId, fotoReceta, token) {
        // Paso 1: Subir la imagen
        const uploadedImage = await uploadImage(fotoReceta, token);
    
        if (uploadedImage) {
            const imageId = uploadedImage.id;  // Obtener el ID de la imagen subida
    
            // Paso 2: Asignar la imagen a la receta
            const updatedReceta = await assignImageToReceta(recetaId, imageId, token);
            
            if (updatedReceta) {
                console.log('Imagen asignada correctamente a la receta');
                setSuccessMessage('Imagen asignada correctamente a la receta');
            } else {
                console.error('Error al asignar la imagen a la receta');
                setSuccessMessage('Error al asignar la imagen a la receta');
            }
        } else {
            console.error('Error al subir la imagen');
            setSuccessMessage('Error al subir la imagen');
        }
    }
    



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Crear el objeto recetaData con todos los datos
        const recetaData = {
            ...formData,
            fecha_publicacion: new Date().toISOString().split('T')[0],
            author: id_usuario,
        };

        var resultado = {
            "data": recetaData
        }

        console.log("", JSON.stringify(resultado));

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:1337/api/recetas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(resultado),
            });

            const responseData = await response.json();
            if (response.ok) {
                const recetaId = responseData.data.documentId;
                if (fotoReceta) {
                    await uploadAndAssignImage(recetaId, fotoReceta, token);
                }
                setSuccessMessage('Receta creada con éxito');
                setTimeout(() => {
                    router.push('/HomeLog');
                }, 2000);
            } else {
                console.error('Error al crear la receta:', responseData.error);
                setSuccessMessage('Error al crear la receta: ' + (responseData.error.message || "Error desconocido"));
            }
        } catch (error) {
            console.error('Error al crear la receta', error);
            setSuccessMessage('Error al crear la receta: ' + error.message);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className="flex-grow flex flex-col items-center p-6">
                <h1 className="text-4xl font-bold mb-8">Crear Receta</h1>
                {successMessage && (
                    <div className="mb-4 text-green-600">{successMessage}</div> // Mensaje de éxito
                )}
                <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {/* Resto del formulario... */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Título:
                        </label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Descripción:
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Foto de la Receta:
                        </label>
                        <input
                            type="file"
                            accept="image/*" // Solo acepta imágenes
                            onChange={handleFileChange} // Establecer la foto en el estado
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Ingredientes:
                        </label>
                        <textarea
                            name="ingredientes"
                            value={formData.ingredientes}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Instrucciones:
                        </label>
                        <textarea
                            name="instrucciones"
                            value={formData.instrucciones}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Tiempo de Preparación (minutos):
                        </label>
                        <input
                            type="number"
                            name="tiempo_preparacion"
                            value={formData.tiempo_preparacion}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Dificultad:
                        </label>
                        <div className="flex items-center">
                            <label className="mr-4">
                                <input
                                    type="radio"
                                    name="dificultad"
                                    value="Fácil"
                                    checked={formData.dificultad === 'Fácil'}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Fácil
                            </label>
                            <label className="mr-4">
                                <input
                                    type="radio"
                                    name="dificultad"
                                    value="Media"
                                    checked={formData.dificultad === 'Media'}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Media
                            </label>
                            <label className="mr-4">
                                <input
                                    type="radio"
                                    name="dificultad"
                                    value="Díficil"
                                    checked={formData.dificultad === 'Díficil'}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Díficil
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Categorías:
                        </label>
                        <div className="flex flex-wrap">
                            {categoriasData.map((categoria, index) => (
                                <label key={index} className="mr-4 mb-2">
                                    <input
                                        type="checkbox"
                                        value={index + 1} // Usar el índice + 1
                                        onChange={(e) => handleCheckboxChange(e, index)} // Pasar el índice
                                        className="hidden"
                                    />
                                    <span className={`inline-block cursor-pointer px-4 py-2 rounded-md border ${categoriaElegidas.categorias.includes(index + 1) ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300'} hover:bg-blue-400 transition`}>
                                        {categoria}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}
                    >
                        Crear Receta
                    </button>
                </form>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default CreateRecipe;
