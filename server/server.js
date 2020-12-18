const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const path = require("path");

process.env.SIDE = process.env.SIDE || 'este-es-mi-clave-secreta';
process.env.CADUCIDAD_TOKEN = 60 * 60 * 60 * 24;
process.env.CLIENT_ID = process.env.CLIENT_ID || '437983785766-h2efv077r3h9leiok1mver6ajcm8uh6q.apps.googleusercontent.com';

//Configuracion del body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configuración global de rutas
app.use(require('../routes/index'));

app.use(express.static(path.resolve(__dirname, '../public')));

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