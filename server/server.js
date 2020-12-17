const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/usuario', (request, response) => {
    //Desde, hasta, estado, id
    let desde = request.query.desde || 0;
    let hasta = request.query.hasta || 5;
    let estado = request.query.estado || true;
    let id_usuario = request.query.id || undefined;

    desde = Number(desde);
    hasta = Number(hasta);

    let criterios = {
        activo: estado
    };

    if (id_usuario) {
        criterios._id = id_usuario;
    }

    Usuario.find(criterios, 'nombre correo rol').skip(desde).limit(hasta).exec((error, data) => {
        if (error) {
            response.status(400).json({
                ok: false,
                error: error
            });
        } else {
            response.json({
                ok: true,
                usuarios: data
            });
        }
    });
});

app.post('/usuario', (request, response) => {
    let body = request.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        clave: bcrypt.hashSync(body.clave, 10),
        rol: body.rol,
        google: body.google,
        activo: body.activo,
        img: body.img
    });

    usuario.save((error, data) => {
        if (error) {
            response.status(400).json({
                ok: false,
                error: error
            });
        } else {
            response.json({
                ok: true,
                usuario: data
            });
        }
    });
});

app.put('/usuario/:id?', (request, response) => {
    let id = request.params.id || undefined;
    let body = _.pick(request.body, ['nombre', 'correo', 'clave']);

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: 'El id de usuario es requerido'
        });
    }

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, data) => {
        if (err) {
            response.status(400).json({
                ok: false,
                error: err
            });
        } else {
            response.json({
                ok: true,
                usuario: data
            });
        }
    });
});

app.delete('/usuario/:id?', (request, response) => {
    let id = request.params.id || undefined;
    const cambios = {
        activo: false
    };

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: 'El id de usuario es requerido'
        });
    }

    Usuario.findByIdAndUpdate(id, cambios, { new: true }, (err, data) => {
        if (err) {
            response.status(400).json({
                ok: false,
                error: err
            });
        } else {
            response.json({
                ok: true,
                usuario: data
            });
        }
    });
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