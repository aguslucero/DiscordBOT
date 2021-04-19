import { Schema, model, Document } from 'mongoose';



const schema = new Schema({
    advertasing: String,
    reino: String,
    vendedores: Array,
    fecha: String,
    total: Number
})

interface IPcrRaid extends Document {
    advertasing: string,
    reino: string,
    vendedores: string[],
    fecha: string,
    total: number
}

export default model<IPcrRaid>('PcrRaid', schema);