import { Schema, model, Document } from 'mongoose';
import Participante from './class/participante'

const schema = new Schema({
  participantes: Array,
  estado: String,
  entradas: Number,
  costo: Number,
  cierre: String,
  total: Number

})

interface ILotery extends Document {
  participantes: Participante[],
  estado: string,
  entradas: number,
  costo: number,
  cierre: string,
  total: number,
}

export default model<ILotery>('Lotery', schema);