const express = require('express');
const path = require('path');
const fs = require('fs');
const { verificaTokenImg } = require('../middlewares/autenticacion');
const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (request, response) => {
    let tipo = request.params.tipo;
    let img = request.params.img;

    let pathImage = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);

    if (!fs.existsSync(pathImage)) {
        pathImage = path.resolve(__dirname, '../server/assets/', 'no-image.jpg');
    }

    response.sendFile(pathImage);
});

module.exports = app;