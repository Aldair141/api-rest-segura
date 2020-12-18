const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');

const app = express();

//Recibir el email y password
app.post("/login", (request, response) => {

    let body = request.body;

    Usuario.findOne({ correo: body.correo }, (err, usuarioDB) => {
        if (err) {
            response.status(400).json({
                ok: false,
                error: err
            });
        } else {
            if (!usuarioDB) {
                response.status(500).json({
                    ok: false,
                    error: {
                        message: '(Usuario) y/o contraseña incorrectos'
                    }
                });
            } else {
                if (!bcrypt.compareSync(body.clave, usuarioDB.clave)) {
                    response.status(500).json({
                        ok: false,
                        error: {
                            message: 'Usuario y/o (contraseña) incorrectos'
                        }
                    });
                } else {
                    let token = jwt.sign({ usuario: usuarioDB }, process.env.SIDE, { expiresIn: process.env.CADUCIDAD_TOKEN });

                    response.json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token
                    });
                }
            }
        }
    });
});

module.exports = app;