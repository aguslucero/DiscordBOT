import { Schema, model, Document } from 'mongoose';



const schema = new Schema({
    total: Number,
    ganancia: Number,
    entregado: Number,

})

interface Istats extends Document {
    total: number,
    ganancia: number,
    entregado: number,
}

export default model<Istats>('Stats', schema);