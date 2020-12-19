const Categoria = require('../models/categoria');
const bodyParser = require('body-parser');
const express = require('express');
const { verificaToken, verificaRolUsuario } = require('../middlewares/autenticacion');
const _ = require('underscore');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/categoria', [verificaToken, verificaRolUsuario], (request, response) => {
    const usuario = request.usuario;

    const body = request.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        usuariocrea: usuario.nombre,
        fechacrea: new Date(),
        usuariomodifica: usuario.nombre,
        fechamodifica: new Date()
    });

    categoria.save((err, data) => {
        if (err) {
            response.status(400).json({
                ok: false,
                error: err
            });
        } else {
            response.json({
                ok: true,
                categoria: data
            });
        }
    });
});

app.get('/categoria', verificaToken, (request, response) => {
    Categoria.find({}, (err, data) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                error: err
            });
        }

        response.json({
            ok: true,
            categorias: data
        });
    });
});

app.get('/categoria/:id?', verificaToken, (request, response) => {
    let id = request.params.id || undefined;

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: 'El ID de la categoría es indispensable para realizar la consulta.'
        });
    }

    Categoria.findOne({ _id: id }, (err, data) => {
        if (err) {
            response.status(400).json({
                ok: false,
                error: err
            });
        } else {
            if (data) {
                response.json({
                    ok: true,
                    categoria: data
                });
            } else {
                response.status(500).json({
                    ok: false,
                    error: 'Esta categoría no existe'
                });
            }
        }
    });
});

app.put('/categoria/:id?', (request, response) => {
    let id = request.params.id || undefined;

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: 'El ID de la categoría es indispensable para realizar una modificación.'
        });
    }

    const datos = _.pick(request.body, ['nombre']);

    Categoria.findByIdAndUpdate(id, datos, { new: true, runValidators: true }, (err, data) => {
        if (err) {
            response.status(400).json({
                ok: false,
                error: err
            });
        } else {
            response.json({
                ok: true,
                categoria: data
            });
        }
    });
});

app.delete('/categoria/:id?', [verificaToken, verificaRolUsuario], (request, response) => {
    let id = request.params.id || undefined;

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: 'El ID de la categoría es indispensable para realizar esta acción.'
        });
    }

    Categoria.findByIdAndDelete(id, (_err, _data) => {
        if (_err) {
            response.status(400).json({
                ok: false,
                error: _err
            })
        } else {
            response.json({
                ok: true,
                usuario: _data
            });
        }
    });
});

module.exports = app;