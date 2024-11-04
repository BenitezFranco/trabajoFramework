const Receta = require('../models/Receta'); // Modelo de receta
const RecetaCategoria = require('../models/Receta_Categoria'); // Modelo de receta_categoria
const Usuario = require ('../models/Usuario');
const Calificacion = require('../models/Calificacion'); // Modelo de calificación
const Categoria = require('../models/Categoria');
const { Op } = require('sequelize');


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
        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rec="http://example.com/recipes">
   <soapenv:Header/>
   <soapenv:Body>
      <rec:getRecipeById>
         <id>${recetaId}</id>
      </rec:getRecipeById>
   </soapenv:Body>
</soapenv:Envelope>`;
                    // Realiza la solicitud SOAP como se muestra en ejemplos anteriores
                    const response = await axios.post('http://localhost:3000/soap', soapRequest, {
                        headers: { 'Content-Type': 'text/xml' }
                    });

                    const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });
                    
                    const receta = result['soap:Envelope']['soap:Body']['tns:getRecipeByIdResponse'];

                    if (!result['soap:Envelope'] || !result['soap:Envelope']['soap:Body']) {
                        ctx.status = 500;
                        ctx.body = { error: 'Respuesta SOAP inválida' };
                        return;
                    }

        if (!receta) {
            ctx.status = 404;
            ctx.body = { error: 'Receta no encontrada' };
            return;
        }

        const recetaTransformada = {
            id_receta: receta['tns:id_receta'],
            titulo: receta['tns:titulo'],
            foto_receta: receta['tns:foto_receta'],
            descripcion: receta['tns:descripcion'],
            ingredientes: Array.isArray(receta['tns:ingredientes'].ingredientes) 
        ? receta['tns:ingredientes'].ingredientes 
        : [receta['tns:ingredientes'].ingredientes],
    
    // Asegura que instrucciones sea siempre un array
    instrucciones: Array.isArray(receta['tns:instrucciones'].instrucciones)
        ? receta['tns:instrucciones'].instrucciones.map((instruccion) => ({
            paso: instruccion.paso,
            imagen: instruccion.imagen && instruccion.imagen['$'] && instruccion.imagen['$']['xsi:nil'] === "true"
                ? null
                : instruccion.imagen
        }))
        : [{
            paso: receta['tns:instrucciones'].instrucciones.paso,
            imagen: receta['tns:instrucciones'].instrucciones.imagen && receta['tns:instrucciones'].instrucciones.imagen['$'] && receta['tns:instrucciones'].instrucciones.imagen['$']['xsi:nil'] === "true"
                ? null
                : receta['tns:instrucciones'].instrucciones.imagen
        }],

            dificultad: receta['tns:dificultad'],
            tiempo_preparacion: receta['tns:tiempo_preparacion'],
            id_usuario: receta['tns:id_usuario']
        };

        console.log("Foto: ",recetaTransformada.foto_receta);

        const usuario = await Usuario.findOne({
            where: { id_usuario: recetaTransformada.id_usuario },
            attributes: ['nombre']
        });

        const idsCategoria = await RecetaCategoria.findAll({
            where: {
                id_receta: recetaTransformada.id_receta
            },
            attributes: ['id_categoria']
        })

        const ids = idsCategoria.map(item => item.id_categoria);

        const categorias = await Categoria.findAll({
            where: {
                id_categoria: { [Op.in]: ids }
            },
            attributes: ['nombre']
        });

        if (!usuario) {
            ctx.status = 404;
            ctx.body = { error: 'Usuario no encontrado' };
            return;
        }
        const recetaConUsuario = {
            ...recetaTransformada,
            nombre_usuario: usuario.nombre,
            categorias: categorias.map(categoria => categoria.dataValues.nombre),
        };
        console.log('receta con usuario y categorias : ', recetaConUsuario);

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
                        console.log(receta);
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
