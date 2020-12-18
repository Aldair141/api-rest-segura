const express = require('express');
const mongoose = require('mongoose');
const hbs = require('hbs');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

process.env.SIDE = process.env.SIDE || 'este-es-mi-clave-secreta';
process.env.CADUCIDAD_TOKEN = 60 * 60 * 60 * 24;

app.set('view engine', 'hbs');

//Configuracion del body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configuración global de rutas
app.use(require('../routes/index'));

app.get("/", (request, response) => {
    response.render("index");
});

const opciones = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}

let cad_conexion = '';
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

if (process.env.NODE_ENV === 'dev') {
    cad_conexion = 'mongodb://localhost:27017/cafe_tarea';
} else {
    cad_conexion = 'mongodb+srv://Aldair619:@@@@S0p0rt3@cluster0.em3cz.mongodb.net/cafe_tarea';
}

mongoose.connect(cad_conexion, opciones, (err) => {
    if (err) throw err;
    console.log("Base de Datos INICIALIZADO");
});

app.listen(port, () => {
    console.log(`Escuchando el puerto ${ port }`);
});