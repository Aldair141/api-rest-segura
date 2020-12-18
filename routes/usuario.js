const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaRolUsuario } = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario', verificaToken, (request, response) => {
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

app.post('/usuario', [verificaToken, verificaRolUsuario], (request, response) => {
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

app.put('/usuario/:id?', [verificaToken, verificaRolUsuario], (request, response) => {
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

app.delete('/usuario/:id?', [verificaToken, verificaRolUsuario], (request, response) => {
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

module.exports = app;