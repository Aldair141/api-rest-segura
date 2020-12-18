//Copiado de google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//Configuracion de Google
async function verify(_token) {
    const ticket = await client.verifyIdToken({
        idToken: _token,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        correo: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token).catch((err) => {
        return res.status(403).json({
            ok: false,
            error: err
        });
    });

    //Guardar en la BD
    Usuario.findOne({ correo: googleUser.correo }, (_error, _usuarioDB) => {
        if (_error) {
            res.status(500).json({
                ok: false,
                error: _error
            });
        };

        //NO se autentica por google ya que tiene registro
        if (_usuarioDB) {
            if (!_usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            }

            //Renovar su token
            let token = jwt.sign({ usuario: _usuarioDB }, process.env.SIDE, { expiresIn: process.env.CADUCIDAD_TOKEN });

            return res.json({
                ok: true,
                usuario: _usuarioDB,
                token: token
            });
        } else {
            //Por primera vez se registra
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.correo = googleUser.correo;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.clave = ":)";

            usuario.save((__error, __usuarioDB) => {
                if (__error) {
                    return res.status(500).json({
                        ok: false,
                        error: __error
                    });
                } else {
                    let token = jwt.sign({ usuario: __usuarioDB }, process.env.SIDE, { expiresIn: process.env.CADUCIDAD_TOKEN });

                    return res.json({
                        ok: true,
                        usuario: __usuarioDB,
                        token: token
                    });
                }
            });
        }
    });
})

module.exports = app;