import { Schema, model, Document } from 'mongoose';



const schema = new Schema({
    userName: { type: String, unique: true },
    balance: Number,
    earned: Number,
    rolls: Number,
    gambled: Number,
    win: Number,
    lost: Number,
    carryMsales: Number,
    carryRsales: Number,
    earnedwhitcarrys: Number
})

interface IBalance extends Document {
    userName: string,
    balance: number
    earned: number,
    rolls: number,
    gambled: number,
    win: number,
    lost: number,
    carryMsales: number,
    carryRsales: number,
    earnedwhitcarrys: number
}

export default model<IBalance>('Balance', schema);