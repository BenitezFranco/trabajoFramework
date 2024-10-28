const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const serve = require('koa-static');
const path = require('path');
const mount = require('koa-mount');
const indexRoutes = require('./routes/index');
const initModels = require('./models/initModels');

const fs = require('fs');
const soap = require('soap');
const soapService = require('./soapService');


// Importa y sincroniza la base de datos
//const syncDatabase = require('./syncDB');
//syncDatabase();


const app = new Koa();

app.use(cors());

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, 'uploads'),
    keepExtensions: true,
  }
}));
initModels();


// Montar una subaplicación para servir archivos estáticos desde 'uploads'
app.use(mount('/uploads', serve(path.join(__dirname, 'uploads'))));

// Usa las rutas en la aplicación
app.use(indexRoutes.routes());
app.use(indexRoutes.allowedMethods());

// Cargar el archivo WSDL
const wsdl = fs.readFileSync(path.join(__dirname, 'recipeService.wsdl'), 'utf8');

// Montar el servicio SOAP en la ruta '/soap'
app.use(async (ctx) => {
  if (ctx.url === '/wsdl' && ctx.method === 'GET') {
    ctx.type = 'text/xml';
    ctx.body = wsdl;
  }
});

const server = app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});

// Servir el servicio SOAP usando soap.listen
soap.listen(server, '/soap', soapService, wsdl);