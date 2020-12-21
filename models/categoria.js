const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Usuario = mongoose.model('Usuario');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    nombre: {
        required: true,
        type: String,
        unique: true
    },
    usuariocrea: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechacrea: {
        type: Date,
        required: true
    },
    usuariomodifica: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechamodifica: {
        type: Date,
        required: true
    }
});

mongoose.plugin(uniqueValidator, {
    message: '{PATH} debe ser un valor único'
});
module.exports = mongoose.model('Categoria', categoriaSchema);