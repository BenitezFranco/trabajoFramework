const Receta = require('../models/Receta'); // Modelo de receta
const RecetaCategoria = require('../models/Receta_Categoria'); // Modelo de receta_categoria
const Usuario = require ('../models/Usuario');
const Calificacion = require('../models/Calificacion'); // Modelo de calificación


const axios = require('axios');
const xml2js = require('xml2js');
// Crear una nueva receta
const crearReceta = async (ctx) => {
    const { titulo, descripcion, instrucciones, ingredientes, dificultad, tiempo_preparacion, categorias,foto_receta } = ctx.request.body;
    const id_usuario = ctx.state.user.id_usuario;

    const nuevaReceta = await Receta.create({
        titulo,
        descripcion,
        instrucciones,
        ingredientes,
        dificultad,
        tiempo_preparacion,
        fecha_publicacion: new Date(), 
        id_usuario,
        foto_receta
    });

    for (const id_categoria of categorias) {
        await RecetaCategoria.create({
            id_receta: nuevaReceta.id_receta,
            id_categoria,
        });
    }

    ctx.body = { message: 'Receta creada exitosamente' };
};

// Obtener una receta por ID
const obtenerReceta = async (ctx) => {
    try {
        const recetaId = ctx.params.id;
        const receta = await Receta.findOne({
            where: { id_receta: recetaId }
        });

        if (!receta) {
            ctx.status = 404;
            ctx.body = { error: 'Receta no encontrada' };
            return;
        }

        const usuario = await Usuario.findOne({
            where: { id_usuario: receta.id_usuario },
            attributes: ['nombre']
        });

        if (!usuario) {
            ctx.status = 404;
            ctx.body = { error: 'Usuario no encontrado' };
            return;
        }

        const recetaConUsuario = {
            ...receta.toJSON(),
            nombre_usuario: usuario.nombre
        };

        ctx.status = 200;
        ctx.body = recetaConUsuario;
        
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Error al obtener la receta' };
    }
};

// Calificar una receta

const calificarReceta = async (ctx) => {
    const { puntuacion } = ctx.request.body;
    const id_receta = ctx.params.id;
    const id_usuario = ctx.state.user.id_usuario;

    try {
        if (puntuacion < 1 || puntuacion > 5) {
            ctx.status = 400;
            ctx.body = { error: 'La puntuación debe estar entre 1 y 5.' };
            return;
        }

        // Verificar si el usuario ya calificó esta receta
        const calificacionExistente = await Calificacion.findOne({
            where: { id_receta, id_usuario }
        });

        if (calificacionExistente) {
            // Actualizar la calificación existente
            await Calificacion.update({ puntuacion }, {
                where: { id_receta, id_usuario }
            });
            ctx.status = 200;
            ctx.body = { message: 'Calificación actualizada exitosamente' };
        } else {
            // Crear una nueva calificación
            const nuevaCalificacion = await Calificacion.create({
                id_receta,
                id_usuario,
                puntuacion
            });
            ctx.status = 201;
            ctx.body = { message: 'Calificación creada exitosamente', id_calificacion: nuevaCalificacion.id_calificacion };
        }
    } catch (error) {
        console.error('Error al calificar la receta:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error al calificar la receta.' };
    }
};

    const obtenerCalificacion = async (ctx) => {
        const id_receta = ctx.params.id;
        const id_usuario = ctx.state.user.id_usuario;
    
        try {
            // Buscar si el usuario ya ha calificado esta receta
            const calificacion = await Calificacion.findOne({
                where: {
                    id_receta,
                    id_usuario
                },
                attributes: ['puntuacion']
            });
    
            if (calificacion) {
                ctx.status = 200;
                ctx.body = { puntuacion: calificacion.puntuacion };
            } else {
                ctx.status = 404;
                ctx.body = { message: 'No has calificado esta receta aún.' };
            }
        } catch (error) {
            console.error('Error al obtener la calificación:', error);
            ctx.status = 500;
            ctx.body = { error: 'Error al obtener la calificación.' };
        }
    };

    const obtenerPromedioCalificacion = async (ctx) => {
        const id_receta = ctx.params.id;
    
        try {
            // Obtener todas las calificaciones de la receta
            const calificaciones = await Calificacion.findAll({
                where: { id_receta },
                attributes: ['puntuacion']
            });
    
            // Calcular el promedio
            const totalCalificaciones = calificaciones.length;
            const suma = calificaciones.reduce((acc, curr) => acc + curr.puntuacion, 0);
            const promedio = totalCalificaciones > 0 ? (suma / totalCalificaciones).toFixed(1) : 0;
    
            ctx.status = 200;
            ctx.body = { promedio };
        } catch (error) {
            console.error('Error al obtener el promedio de calificaciones:', error);
            ctx.status = 500;
            ctx.body = { error: 'Error al obtener el promedio de calificaciones.' };
        }
    };

    
            async function obtenerTodas(ctx) {
                try {
                    const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rec="http://example.com/recipes">
               <soapenv:Header/>
               <soapenv:Body>
                  <rec:listAllRecipes/>
               </soapenv:Body>
            </soapenv:Envelope>`;
                    // Realiza la solicitud SOAP como se muestra en ejemplos anteriores
                    const response = await axios.post('http://localhost:3000/soap', soapRequest, {
                        headers: { 'Content-Type': 'text/xml' }
                    });
            
                    const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });
                    

                    if (!result['soap:Envelope'] || !result['soap:Envelope']['soap:Body']) {
                        ctx.status = 500;
                        ctx.body = { error: 'Respuesta SOAP inválida' };
                        return;
                    }
            
                    const recetas = result['soap:Envelope']['soap:Body']['tns:listAllRecipesResponse']['tns:recipes'].recipes;
                    
                    // Asegúrate de que `recetas` es un array antes de mapearlo
                    if (!Array.isArray(recetas)) {
                        ctx.status = 500;
                        ctx.body = { error: 'No se encontraron recetas en la respuesta' };
                        return;
                    }
                    
                    const formattedRecetas = recetas.map((receta) => {
                        // Esto imprimirá cada objeto 'receta' en la consola
                        
                        return {
                            id_receta: receta.id_receta,
                            titulo: receta.titulo,
                            foto_receta: receta.foto_receta,
                            descripcion: receta.descripcion,
                            dificultad: receta.dificultad,
                        };
                    });
            
                    ctx.body = { recetas: formattedRecetas };
                } catch (error) {
                    console.error('Error al obtener recetas:', error);
                    ctx.status = 500;
                    ctx.body = { error: 'Error interno del servidor' };
                }
            }
            
      
    

module.exports = { crearReceta, obtenerReceta, calificarReceta, obtenerCalificacion, obtenerPromedioCalificacion, obtenerTodas};
