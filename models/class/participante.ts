var moment = require('moment-timezone');
moment().tz("America/Argentina/Buenos_Aires").format
export default class Participante {
  userName: string;
  cantidad: number;
  horario: string;


  constructor(name: string) {
    this.userName = name;
    this.cantidad = 1
    this.horario = moment().format('MMMM Do YYYY, h:mm:ss a');
  }



}