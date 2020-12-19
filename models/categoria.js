const { request } = require("express");
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

const opciones_string = {
    required: true,
    type: String
};

const opciones_date = {
    type: Date,
    required: true
}

let categoriaSchema = new Schema({
    nombre: {
        required: true,
        type: String,
        unique: true
    },
    usuariocrea: opciones_string,
    fechacrea: opciones_date,
    usuariomodifica: opciones_string,
    fechamodifica: opciones_date
});

mongoose.plugin(uniqueValidator, {
    message: '{PATH} debe ser un valor único'
});
module.exports = mongoose.model('Categoria', categoriaSchema);