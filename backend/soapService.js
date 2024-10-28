const Receta = require('./models/Receta');

const soapService = {
  RecipeService: {
    RecipeServiceSoapPort: {
      getRecipeById: async function(args) {
        const { id } = args;
        try {
          const recipe = await Receta.findByPk(id);
          if (recipe) {
            return {
              id_receta: recipe.id_receta,
              titulo: recipe.titulo,
              foto_receta: recipe.foto_receta,
              descripcion: recipe.descripcion,
              ingredientes: JSON.parse(recipe.ingredientes).join(', '),
              instrucciones: JSON.parse(recipe.instrucciones).join(', '),
              dificultad: recipe.dificultad,
              tiempo_preparacion: recipe.tiempo_preparacion
            };
          } else {
            return { error: 'Recipe not found' };
          }
        } catch (error) {
          return { error: error.message };
        }
      },
      listAllRecipes: async function() {
        try {
          const recipes = await Receta.findAll();
          return {
            recipes: recipes.map(recipe => ({
              id_receta: recipe.id_receta,
              titulo: recipe.titulo,
              foto_receta: recipe.foto_receta,
              descripcion: recipe.descripcion,
              ingredientes: JSON.parse(recipe.ingredientes).join(', '),
              instrucciones: JSON.parse(recipe.instrucciones).join(', '),
              dificultad: recipe.dificultad,
              tiempo_preparacion: recipe.tiempo_preparacion
            })),
          };
        } catch (error) {
          return { error: error.message };
        }
      },
    },
  },
};

module.exports = soapService;
