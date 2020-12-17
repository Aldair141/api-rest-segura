const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        required: [true, 'El nombre es obligatorio.'],
        type: String
    },
    correo: {
        required: [true, 'El correo es obligatorio.'],
        type: String,
        unique: true
    },
    clave: {
        required: [true, 'La clave es obligatoria.'],
        type: String
    },
    rol: {
        type: String,
        default: 'USER_ROLE',
        enum: {
            values: ['USER_ROLE', 'ADMIN_ROLE'],
            message: '{VALUE} no es un rol válido.'
        }
    },
    google: {
        type: Boolean,
        default: false
    },
    activo: {
        type: Boolean,
        default: true
    },
    img: {
        type: String,
        default: '../img/no-image.png'
    }
});

usuarioSchema.methods.toJSON = function() {
    let _obj = this;
    let _objProcess = _obj.toObject();
    delete _objProcess.clave;
    return _objProcess;
}

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser un valor único.'
});
module.exports = mongoose.model("Usuario", usuarioSchema);