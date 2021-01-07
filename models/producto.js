const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let productoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio.'],
        unique: true
    },
    precioUni: {
        type: Number,
        required: [true, 'El precio del producto es obligatorio.']
    },
    descripcion: {
        type: String
    },
    disponible: {
        type: Boolean,
        default: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        required: [true, 'La categoría del producto es obligatorio.'],
        ref: 'Categoria'
    },
    usuarioCrea: {
        type: Schema.Types.ObjectId,
        required: [true, 'El usuario creador es obligatorio.'],
        ref: 'Usuario'
    },
    fechaCrea: {
        type: Date
    },
    usuarioModifica: {
        type: Schema.Types.ObjectId,
        required: [true, 'El usuario creador es obligatorio.'],
        ref: 'Usuario'
    },
    fechaModifica: {
        type: Date
    },
    img: {
        type: String,
        default: "no-image.jpg"
    }
});

module.exports = mongoose.model('Producto', productoSchema);