import { Schema, model, Document } from 'mongoose';



const schema = new Schema({
    advertasing: String,
    reino: String,
    vendedor1: String,
    vendedor2: String,
    vendedor3: String,
    vendedor4: String,
    fecha: String,
    total: Number
})

interface IPcrMithic extends Document {
    advertasing: string,
    reino: string,
    vendedor1: string,
    vendedor2: string,
    vendedor3: string,
    vendedor4: string,
    fecha: string,
    total: number
}

export default model<IPcrMithic>('PcrMithics', schema);