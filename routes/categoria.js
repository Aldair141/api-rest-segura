const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');
const bodyParser = require('body-parser');
const express = require('express');
const { verificaToken, verificaRolUsuario } = require('../middlewares/autenticacion');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/categoria', [verificaToken, verificaRolUsuario], (request, response) => {
    const usuario = request.usuario;

    const body = request.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        usuariocrea: usuario._id,
        fechacrea: new Date(),
        usuariomodifica: usuario._id,
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

app.get("/categoria", verificaToken, (request, response) => {
    Categoria.find({})
        .sort('fechacrea')
        .populate('usuariocrea usuariomodifica', 'nombre correo', Usuario)
        .exec((err, data) => {
            if (err) {
                response.status(500).json({
                    ok: false,
                    error: err
                });
            } else {
                response.json({
                    ok: true,
                    categorias: data
                });
            }
        });
});

app.get('/categoria/:id?', verificaToken, (request, response) => {
    let id = request.params.id || undefined;

    if (id === undefined) {
        return response.status(500).json({
            ok: false,
            error: 'El ID de la categoría es indispensable para realizar la consulta.'
        });
    }

    Categoria.findOne({ _id: id }, (err, data) => {
        if (err) {
            response.status(500).json({
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

app.put('/categoria/:id?', [verificaToken, verificaRolUsuario], (request, response) => {
    let id = request.params.id || undefined;
    let body = request.body;
    let usuario = request.usuario;

    if (id === undefined) {
        return response.status(500).json({
            ok: false,
            error: 'El ID de la categoría es indispensable para realizar una modificación.'
        });
    }

    const datosNuevos = {
        nombre: body.nombre,
        usuariomodifica: usuario._id,
        fechamodifica: new Date()
    }

    Categoria.findByIdAndUpdate(id, datosNuevos, { new: true, runValidators: true, context: 'query' }, (err, data) => {
        if (err) {
            response.status(500).json({
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
            if (!_data) {
                response.status(400).json({
                    ok: false,
                    error: 'Esta categoría no existe.'
                });
            } else {
                response.json({
                    ok: true,
                    message: 'Categoría eliminada.'
                });
            }
        }
    });
});

module.exports = app;