const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const app = express();

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (request, response) => {
    if (!request.files) {
        return response.status(400).json({
            ok: false,
            error: {
                message: 'No se ha cargado ningun archivo.'
            }
        });
    }

    let archivo = request.files.archivo;
    let tipo = request.params.tipo;
    let id = request.params.id;

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            error: {
                message: `Los tipos permitidos son: ${ tiposValidos.join(', ') }`
            }
        });
    }

    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return response.status(400).json({
            ok: false,
            error: {
                message: `Las extensiones permitidas son: ${ extensionesValidas.join(', ') }`,
                extension: extension
            }
        });
    }

    //Cambiar nombre al archivo
    let nomArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    //Cargando imagen a la carpeta del servidor
    archivo.mv(`uploads/${ tipo }/${ nomArchivo }`, (err) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                err: err,
                message: 'El archivo no se pudo subir al servidor'
            });
        }

        //Asignando la imgen al registro de BASE DE DATOS
        if (tipo === "usuarios") {
            imagenUsuario(id, nomArchivo, response);
        } else {
            imagenProducto(id, nomArchivo, response);
        }
    });
});

function imagenUsuario(id, nomimagen, res) {
    Usuario.findById(id, (err, data) => {
        if (err) {
            borrarImagen(nomimagen, 'usuarios');
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!data) {
            borrarImagen(nomimagen, 'usuarios');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Este usuario no existe en la Base de Datos'
                }
            });
        }

        borrarImagen(data.img, 'usuarios');

        data.img = nomimagen;

        data.save((_error, _data) => {
            if (_error) {
                borrarImagen(nomimagen, 'usuarios');
                return res.status(500).json({
                    ok: false,
                    error: _error
                });
            }

            res.json({
                ok: true,
                message: 'Imagen subida satisfactoriamente.',
                usuario: _data
            });
        });
    });
}

function imagenProducto(id, nomarchivo, res) {
    Producto.findById(id, (err, data) => {
        if (err) {
            borrarImagen(nomarchivo, 'productos');
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!data) {
            borrarImagen(nomarchivo, 'productos');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Este producto no existe en la Base de Datos'
                }
            });
        }

        borrarImagen(data.img, 'productos');

        data.img = nomarchivo;
        data.save((_error, _data) => {
            if (_error) {
                borrarImagen(nomarchivo, 'productos');
                res.json({
                    ok: false,
                    error: _error
                });
            } else {
                res.json({
                    ok: true,
                    message: 'Imagen subida satisfactoriamente.',
                    producto: _data
                });
            }
        });
    });
}

function borrarImagen(nomImagen, tipo) {
    let pathImagen = path.resolve(__dirname, '../uploads/' + tipo + '/', nomImagen);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;