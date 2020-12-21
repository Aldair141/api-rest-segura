const jwt = require('jsonwebtoken');
//Función que verifique el token
//next => Continuar con la ejecucion
let verificaToken = (request, response, next) => {
    let token = request.get('Authorization'); //Trae una cabecera
    jwt.verify(token, process.env.SIDE, (err, decoded) => {
        if (err) {
            return response.status(401).json({
                ok: false,
                error: err
            });
        }

        request.usuario = decoded.usuario;
        next();
    });
};

let verificaRolUsuario = (request, response, next) => {
    let rol = request.usuario.rol;

    if (rol !== "ADMIN_ROLE") {
        return response.status(401).json({
            ok: false,
            err: {
                message: 'Sólo los usuarios administradores pueden ejecutar esta acción'
            }
        });
    }

    response.usuario = request.usuario;
    next();
};

let verificaTokenImg = (request, response, next) => {
    let token = request.query.token;

    jwt.verify(token, process.env.SIDE, (err, decoded) => {
        if (err) {
            return response.status(401).json({
                ok: false,
                error: err
            });
        }

        request.usuario = decoded.usuario;
        next();
    });
}

module.exports = {
    verificaToken,
    verificaRolUsuario,
    verificaTokenImg
};