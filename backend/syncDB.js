const sequelize = require('./config/dbConfig'); // Importa la conexión a la base de datos
const axios = require('axios');
const CalendarioSemanal_Receta=require('./models/CalendarioSemanal_Receta');
const CalendarioSemanal =require('./models/CalendarioSemanal');
const Calificacion=require('./models/Calificacion');
const Categoria=require('./models/Categoria');
const Comentario=require('./models/Comentario');
const Favorito=require('./models/Favorito');
const Receta_Categoria=require('./models/Receta_Categoria');
const Receta= require('./models/Receta');
const Seguimiento=require('./models/Seguimiento');
const Usuario=require('./models/Usuario');

const TRANSLATE_API_URL = 'http://localhost:5000/translate';

// Función para traducir texto usando LibreTranslate
async function translateText(text, targetLang = 'es') {
    try {
        const response = await axios.post(TRANSLATE_API_URL, {
            q: text,
            source: 'en',
            target: targetLang,
            format: 'text'
        });
        return response.data.translatedText;
    } catch (error) {
        console.error('Error al traducir el texto:', error.message);
        throw error;
    }
}

// Función para obtener una receta completa por ID y traducirla
async function getAndTranslateRecipe(recipeId) {
    try {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`;
        const response = await axios.get(url);
        const recipe = response.data.meals[0]; // Suponemos que hay al menos una receta

        if (recipe) {
            // Traducir el título de la receta
            const translatedName = await translateText(recipe.strMeal);
            
            // Traducir las instrucciones y dividirlas en un arreglo por saltos de línea
            const translatedInstructions = await translateText(recipe.strInstructions);
            const instructionsArray = translatedInstructions
  .split(/\r?\n/) // Divide en cada nueva línea
  .filter(step => step.trim() !== '') // Filtra líneas vacías
  .map((step, index) => ({ paso: `Paso ${index + 1}: ${step}`, imagen: null })); // Crea objetos con "paso" y "imagen"


            // Traducir los ingredientes y sus medidas
            const translatedIngredients = [];

for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
        const ingredientTrad = await translateText(ingredient);
        const measureTrad = await translateText(measure);
        const translatedIngredient = await translateText(`${ingredientTrad} ${measureTrad}`);
        
        // Agrega el ingrediente traducido como un objeto con la clave "nombre"
        translatedIngredients.push({ nombre: translatedIngredient });
    }
}

            // Estructurar la receta traducida
            const translatedRecipe = {
                title: translatedName,
                category: recipe.strCategory, // La categoría se mantiene en inglés
                imageUrl: recipe.strMealThumb,
                ingredients: translatedIngredients,
                instructions: instructionsArray
            };

            return translatedRecipe;
        } else {
            console.log(`No se encontró la receta con ID: ${recipeId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error al obtener la receta por ID ${recipeId}:`, error.message);
        throw error;
    }
}

const insertRecetaCategoria = async (idReceta, nombreCategoria) => {
    let idCategoria;

    // Asignar el id_categoria basado en el nombre de la categoría
    switch (nombreCategoria) {
        case 'Beef':
            idCategoria = 10; 
            break;
        case 'Breakfast':
            idCategoria = 3; 
            break;
        case 'Chicken':
            idCategoria = 10; 
            break;
        case 'Dessert':
            idCategoria = 6;
            break;
        case 'Goat':
            idCategoria = 10; 
            break;
        case 'Lamb':
            idCategoria = 10; 
            break;
        case 'Miscellaneous':
            idCategoria = 14; 
            break;
        case 'Pasta':
            idCategoria = 10; 
            break;
        case 'Pork':
            idCategoria = 10;
            break;
        case 'Seafood':
            idCategoria = 10; 
            break;
        case 'Side':
            idCategoria = 15; 
            break;
        case 'Starter':
            idCategoria = 15; 
            break;
        case 'Vegan':
            idCategoria = 2; 
            break;
        case 'Vegetarian':
            idCategoria = 1; 
            break;
        default:
            console.log(`Categoría "${nombreCategoria}" no reconocida.`);
            return; 
    }

    try {
        await Receta_Categoria.create({
            id_receta: idReceta,
            id_categoria: idCategoria,
        });

        console.log(`Receta con ID ${idReceta} asociada a la categoría ID ${idCategoria} ("${nombreCategoria}") exitosamente.`);
    } catch (error) {
        console.error('Error al insertar en Receta_Categoria:', error);
    }
};

// Función para obtener y traducir recetas
const fetchAndTranslateRecipes = async () => {
    try {
        const categoriesUrl = 'https://www.themealdb.com/api/json/v1/1/list.php?c=list';
        const categoriesResponse = await axios.get(categoriesUrl);

        if (!categoriesResponse.data || !categoriesResponse.data.meals) {
            console.error('No se encontraron categorías en la respuesta de la API.');
            return;
        }

        const categories = categoriesResponse.data.meals;

        for (const category of categories) {
            const categoryName = category.strCategory;

            // Obtener recetas por categoría
            const recipeUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`;
            const recipeResponse = await axios.get(recipeUrl);
            const recipes = recipeResponse.data.meals;

            if (recipes && recipes.length > 0) {
                // Tomar hasta dos recetas de la categoría
                const recipesToTranslate = recipes.slice(0, 2);

                for (const recipe of recipesToTranslate) {
                    const recipeId = recipe.idMeal;
                    const translatedRecipe = await getAndTranslateRecipe(recipeId);

                    if (translatedRecipe) {
                        // Preparar los datos para la inserción
                        const newRecipe = {
                            titulo: translatedRecipe.title,
                            descripcion: translatedRecipe.title, // Descripción igual al título
                            instrucciones: translatedRecipe.instructions,
                            ingredientes: translatedRecipe.ingredients,
                            dificultad: 'Media', // Establecer dificultad
                            tiempo_preparacion: 77, // Establecer tiempo de preparación
                            fecha_publicacion: new Date(), // Fecha de publicación
                            id_usuario: 1, // ID de usuario fijo (ajusta según tus necesidades)
                            foto_receta: translatedRecipe.imageUrl,
                        };

                        // Insertar la nueva receta en la base de datos
                        const createdRecipe = await Receta.create(newRecipe);
                        console.log('Receta insertada:', translatedRecipe.title);
                        // Asegúrate de usar el ID de receta correcto
                        await insertRecetaCategoria(createdRecipe.id_receta, categoryName);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error al obtener y traducir recetas:', error.message);
    }
};

const insertUsuario = async () => {
    const usuarios = [
        {
            nombre: 'Franco',
            correo_electronico: 'franco@franco.com',
            contrasena: 'franco123',
        },
    ];

    try {
        for (const usuario of usuarios) {
            await Usuario.findOrCreate({
                where: { correo_electronico: usuario.correo_electronico }, 
                defaults: { 
                    nombre: usuario.nombre,
                    contrasena: usuario.contrasena,
                }
            });
        }
        console.log('Usuarios verificados y creados si no existían');
    } catch (error) {
        console.error('Error al verificar o crear usuarios:', error);
    }
};

const insertCategoria = async () => {
    const categorias = [
        { nombre: 'Vegetariano' },
        { nombre: 'Vegano' },
        { nombre: 'Desayuno' },
        { nombre: 'Sin TACC' },
        { nombre: 'Sin gluten' },
        { nombre: 'Postres' },
        { nombre: 'Saludables' },
        { nombre: 'Cenas' },
        { nombre: 'Almuerzos' },
        { nombre: 'Platos principales' },
        { nombre: 'Aperitivos' },
        { nombre: 'Bebidas' },
        { nombre: 'Dulces' },
        { nombre: 'Ensaladas' },
        { nombre: 'Sopas y cremas' },
    ];

    try {
        for (const categoria of categorias) {
            await Categoria.findOrCreate({
                where: { nombre: categoria.nombre },
                defaults: { nombre: categoria.nombre }
            });
        }
        console.log('Categorías verificadas y creadas si no existían');
    } catch (error) {
        console.error('Error al verificar o crear categorías:', error);
    }                        
}

// Función para sincronizar la base de datos
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true }); // Usa force: true solo si deseas reiniciar la base de datos

        await insertUsuario(); // Inserta usuarios
        await insertCategoria(); // Inserta categorías
        await fetchAndTranslateRecipes(); // Llama a la función para obtener y traducir recetas
        console.log('Base de datos sincronizada correctamente.');
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
};

module.exports = syncDatabase;
