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
        if(name==="tiempo_preparacion"){
            setFormData({ ...formData, [name]: parseInt(value)});
        }else{
        setFormData({ ...formData, [name]: value });
        }
    };

    const handleCheckboxChange = (e, categoriaIndex) => {
        const { checked } = e.target;
        if (checked) {
            setFormData({
                ...formData,
                categorias: [...formData.categorias, categoriaIndex + 1], // Agregar el índice + 1
            });
        } else {
            setFormData({
                ...formData,
                categorias: formData.categorias.filter((cat) => cat !== categoriaIndex + 1), // Remover el índice + 1
            });
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFotoReceta(file);
        console.log(file);
    };

    /**
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Crear el objeto recetaData con todos los datos
        const recetaData = {
            ...formData,
            fecha_publicacion: new Date().toISOString().split('T')[0],
            author: id_usuario,
        };
    
        // Crear el FormData
        var formDataToSend = new FormData();
    
        // Agregar el objeto recetaData como JSON
        formDataToSend.append("\"data\"", JSON.stringify(recetaData));
        
        console.log("formDataToSend", formDataToSend);
          Agregar la foto si existe
        if (fotoReceta) {
            formDataToSend.append('foto_receta', fotoReceta); 
            console.log("fotoReceta ", fotoReceta);
            console.log("formDataToSend", formDataToSend);
        }
        
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch('http://localhost:1337/api/recetas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // No es necesario establecer Content-Type aquí, el navegador lo maneja automáticamente
                },
                body: formDataToSend,
            });
    
            const responseData = await response.json();
            if (response.ok) {
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
    */
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Crear el objeto recetaData
        const recetaData = {
            titulo: "Pizza",
            descripcion: "Pizza deliciosa",
            instrucciones: "Sigue estos pasos...",
            ingredientes: "Masa, salsa de tomate, queso",
            dificultad: "Media",
            tiempo_preparacion: 25,
            categorias: [165, 166], // Asegúrate de que estos IDs existan en tu base de datos
            fecha_publicacion: "2024-10-02",
            author: 3 // Asegúrate de que el autor existe
        };
    
        // Crear el FormData
        const formDataToSend = new FormData();
    
        // Agregar el objeto recetaData como JSON en la clave 'data'
        formDataToSend.append('data', JSON.stringify(recetaData));
    
        // Aquí puedes agregar cualquier archivo adicional si lo necesitas
        // if (fotoReceta) {
        //     formDataToSend.append('foto_receta', fotoReceta);
        // }
    
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch('http://localhost:1337/api/recetas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // No necesitas establecer Content-Type aquí, el navegador lo maneja automáticamente
                },
                body: formDataToSend,
            });
    
            const responseData = await response.json();
    
            if (response.ok) {
                console.log('Receta creada con éxito:', responseData);
            } else {
                console.error('Error al crear la receta:', responseData.error);
            }
        } catch (error) {
            console.error('Error al crear la receta:', error);
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
                                    value="Difícil"
                                    checked={formData.dificultad === 'Difícil'}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Difícil
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
                                    <span className={`inline-block cursor-pointer px-4 py-2 rounded-md border ${formData.categorias.includes(index + 1) ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300'} hover:bg-blue-400 transition`}>
                                        {categoria}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
