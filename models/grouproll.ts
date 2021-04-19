import { Schema, model, Document } from 'mongoose';



const schema = new Schema({
    embedId: { type: String, unique: true },
    finish: Boolean
})

interface IGroupRoll extends Document {
    embedId: string,
    finish: boolean
}

export default model<IGroupRoll>('GroupRoll', schema);