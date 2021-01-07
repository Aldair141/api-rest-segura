const express = require('express');
const Producto = require('../models/producto');
const { verificaToken, verificaRolUsuario } = require('../middlewares/autenticacion');
const _ = require('underscore');
const app = express();

app.post('/producto', [verificaToken, verificaRolUsuario], (request, response) => {
    const body = request.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        categoria: body.categoria,
        usuarioCrea: request.usuario._id,
        fechaCrea: new Date(),
        usuarioModifica: request.usuario._id,
        fechaModifica: new Date()
    });

    producto.save((err, data) => {
        if (err) {
            response.status(500).json({
                ok: false,
                error: err
            });
        } else {
            response.status(201).json({
                ok: true,
                producto: data
            });
        }
    });
});

app.get('/producto', verificaToken, (request, response) => {
    let desde = request.query.desde || 0;
    let limite = request.query.limite || 5;

    desde = Number(desde);
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'nombre', 'Categoria')
        .populate('usuarioCrea usuarioModifica', 'nombre correo', 'Usuario')
        .exec((err, data) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    error: err
                });
            }

            Producto.count({ disponible: true }, (_error, _cantidad) => {
                if (_error) {
                    return response.status(500).json({
                        ok: false,
                        error: _error
                    });
                }

                response.json({
                    ok: true,
                    productos: data,
                    cantidad: _cantidad
                });
            });
        });
});

app.get('/producto/:id?', verificaToken, (request, response) => {
    const id = request.params.id || undefined;

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: {
                message: 'El id del producto es necesario para realizar la búsqueda.'
            }
        });
    }

    Producto.findOne({ _id: id })
        .populate('categoria', 'nombre', 'Categoria')
        .populate('usuarioCrea usuarioModifica', 'nombre correo', 'Usuario')
        .exec((err, data) => {
            if (err) {
                response.status(500).json({
                    ok: false,
                    error: err
                });
            } else {
                if (!data) {
                    response.status(400).json({
                        ok: false,
                        error: {
                            message: 'El producto buscado no existe.'
                        }
                    });
                } else {
                    response.json({
                        ok: true,
                        producto: data
                    });
                }
            }
        });
});

app.get('/producto/buscar/:termino', (request, response) => {
    let termino = request.params.termino;
    let regExp = new RegExp(termino, 'i');

    const filtro = { nombre: regExp };

    Producto.find(filtro).exec((err, data) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                error: err
            });
        }

        Producto.count(filtro, (_err, _data) => {
            if (_err) {
                return response.status(500).json({
                    ok: false,
                    error: _err
                });
            }

            response.json({
                ok: true,
                productos: data,
                cantidad: _data
            });
        });
    });
});

app.get('/producto/disponible/:nombre', [verificaToken], (request, response) => {
    let nombre = request.params.nombre || undefined;

    if (nombre === undefined) {
        return response.status(400).json({
            ok: false,
            error: {
                message: 'No se envió ningun valor.'
            }
        });
    }

    //Buscar el producto por el nombre
    let regExp = new RegExp(nombre, 'i');
    Producto.findOne({ nombre: regExp }, (err, data) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!data) {
            return response.json({
                ok: true,
                disponible: true
            });
        } else {
            return response.json({
                ok: true,
                disponible: false
            });
        }
    });
});

app.put('/producto/:id?', [verificaToken, verificaRolUsuario], (request, response) => {
    const id = request.params.id || undefined;

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: {
                message: 'El id del producto es necesario para realizar la modificación.'
            }
        });
    }

    let body = _.pick(request.body, ['nombre', 'precioUni', 'descripcion', 'categoria']);
    body.usuarioModifica = request.usuario._id;
    body.fechaModifica = new Date();

    Producto.findByIdAndUpdate(id, body, { runValidators: true, new: true, context: 'query' }, (err, data) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!data) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'El producto que quiere modificar no existe.'
                }
            });
        }

        response.json({
            ok: true,
            producto: data
        });
    });
});

app.delete('/producto/:id?', [verificaToken, verificaRolUsuario], (request, response) => {
    const id = request.params.id || undefined;

    if (id === undefined) {
        return response.status(400).json({
            ok: false,
            error: {
                message: 'El id del producto es necesario para realizar la eliminación.'
            }
        });
    }

    const nuevosValores = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, nuevosValores, (err, data) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!data) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'El producto que quiere eliminar no existe.'
                }
            });
        }

        response.json({
            ok: true,
            message: 'El producto fue eliminado satisfactoriamente.'
        });
    });
});

module.exports = app;