import { Client, Message, TextChannel, MessageEmbed, MessageReaction, EmbedField, User, GuildMember, ReactionEmoji } from "discord.js";
import { cpuUsage } from "process";
import GroupRoll from '../grouproll'
import * as embeds from '../../Embeds'
import BalanceModel from "../balance";
import Balance from '../balance'
import Lotery from "../lotery";
import Participante from "./participante";
import * as roll from '../../roll.controller'
var moment = require('moment-timezone');
moment().tz("America/Argentina/Buenos_Aires").format();


const regex = /(\d+)/g;
const erroravatar = "https://i.pinimg.com/originals/4c/22/18/4c2218f5cc96ba76c0e590cd1dadb1bc.gif"
const discordavatar = "https://media1.tenor.com/images/54cc77830f82ef67471d8d868d09ad2f/tenor.gif?itemid=11230336"
const comision = 0.99
const lotery1 = 0.65
const lotery2 = 0.20
const lotery3 = 0.10
const loteryCost = 15000

export default class SingletonLoteria {
  private static instance: SingletonLoteria;

  /**
   * The SingletonLoteria's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() { }

  /**
   * The static method that controls the access to the SingletonLoteria instance.
   *
   * This implementation let you subclass the SingletonLoteria class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): SingletonLoteria {
    if (!SingletonLoteria.instance) {
      SingletonLoteria.instance = new SingletonLoteria();
    }

    return SingletonLoteria.instance;
  }

  /**
   * Finally, any SingletonLoteria should define some business logic, which can be
   * executed on its instance.
   */
  public async Loteryadd(user: GuildMember): Promise<boolean> {
    let comprador = await Balance.findOne({ userName: user.displayName })

    if (comprador) {
      if (comprador.balance >= 15000) {
        comprador.balance = comprador.balance - 15000
        comprador.save()
        user.send("Compraste un nuevo ticket para la loteria, nuevo balance: " + comprador.balance)
      } else {
        user.send("no tienes balance suficiente para ingresar a la loteria")
        return false
      }
    } else {
      return false
    }
    return true
  }

  public async Loterysub(user: GuildMember, cant: number): Promise<boolean> {
    let comprador = await Balance.findOne({ userName: user.displayName })
    if (comprador) {
      if (cant > 0) {
        comprador.balance = comprador.balance + 15000 * cant
        comprador.save()
        user.send("se han devuelto todos tus ticket, nuevo balance" + comprador.balance)
      } else {
        user.send("No tienes tickets comprados")
      }
    } else {
      return false
    }
    return true
  }


  public async createLotery(message: Message) {
    var loteria = await Lotery.findOne({ estado: "Abierta" })
    let fecha = moment().add(7, "days").format("LLL");
    if (loteria) {
      let embedlotery = embeds.lottery
      let fields = embedlotery.fields
      let entrys = loteria.entradas
      fields[1].name = "🎟️ Entradas: " + entrys.toString() // agrego una nueva entrada
      fields[3].name = " ⏲️ Cierre: " + loteria.cierre
      fields[5].name = " Primer premio: <:gold:827663569565908993>" + loteria.total * lotery1
      fields[6].name = " Segundo premio: <:gold:827663569565908993>" + loteria.total * lotery2
      fields[7].name = " Tercer premio: <:gold:827663569565908993>" + loteria.total * lotery3
      message.channel.send(embedlotery)
        .then(async function (message) {
          message.react("🎟️")
          message.react("❌")
          message.react("❓")
        })
    } else {
      var newloteria = embeds.lottery
      let newlotery = {
        participantes: [],
        estado: "Abierta",
        entradas: 0,
        costo: loteryCost,
        cierre: fecha,
        total: 0,
      }
      let lotery = new Lotery(newlotery)
      lotery.save()
        .then(res => {
          let fields = newloteria.fields
          fields[3].name = " ⏲️ Cierre: " + lotery.cierre
          message.channel.send(newloteria)
            .then(async function (message) {
              message.react("🎟️")
              message.react("❌")
              message.react("❓")
            })
        })
        .catch(err => console.log(err))
    }
  }



  public async removeTicketsLotery(reaction: MessageReaction, member: GuildMember): Promise<boolean> {
    let loteria = await Lotery.findOne({ estado: "Abierta" })
    if (loteria) {
      let participante = loteria!.participantes.filter((function (nickname) { return nickname.userName == member.displayName }))
      let cantidad = participante[0].cantidad

      await this.Loterysub(member, cantidad)
        .then(async res => {
          console.log(res)
          if (res && loteria) {
            loteria.entradas = loteria.entradas - cantidad
            loteria.total = loteria.total - loteryCost * cantidad
            let index = loteria.participantes.indexOf(participante[0])
            console.log(loteria.participantes[index])
            let newParticipante = new Participante(member.displayName)
            newParticipante.cantidad = 0
            loteria.participantes.splice(index, 1)
            loteria.participantes.push(newParticipante)
            console.log(loteria.participantes[index])
            await loteria.save()
            reaction.message.channel.messages.fetch({ around: reaction.message.id, limit: 1 })
              .then(async msg => {
                let fetchedMsg = msg.first();
                let embedlotery = fetchedMsg?.embeds[0]!
                let fields = embedlotery.fields
                fields[1].name = "🎟️ Entradas: " + loteria!.entradas// agrego una nueva entrada
                fields[5].name = " Primer premio: <:gold:827663569565908993>" + loteria!.total * lotery1
                fields[6].name = " Segundo premio: <:gold:827663569565908993>" + loteria!.total * lotery2
                fields[7].name = " Tercer premio: <:gold:827663569565908993>" + loteria!.total * lotery3
                embedlotery.fields = fields
                reaction.message.edit(embedlotery)
                return true
              })
              .catch(err => {
                console.log(err)
                return false
              })

          } else {
            return false
          }
        })
        .catch(err => {
          console.log(err)
          return false
        })
      return true
    } else {
      member.send("la loteria ya finalizo")
      return false
    }
  }


  public async addTicketLotery(reaction: MessageReaction, member: GuildMember): Promise<boolean> {
    let loteria = await Lotery.findOne({ estado: "Abierta" })
    if (loteria) {
      await this.Loteryadd(member)
        .then(async res => {
          console.log(res)
          if (res && loteria) {
            loteria.entradas = loteria.entradas + 1
            loteria.total = loteria.total + loteryCost
            let participante = loteria.participantes.filter((function (nickname) { return nickname.userName == member.displayName }))
            if (participante.length > 0) {
              let index = loteria.participantes.indexOf(participante[0])
              let newParticipante = new Participante(member.displayName)
              newParticipante.cantidad = loteria.participantes[index].cantidad + 1
              loteria.participantes.splice(index, 1)
              loteria.participantes.push(newParticipante)
            } else {
              let newParticipante = new Participante(member.displayName)
              loteria.participantes.push(newParticipante)

            }
            await loteria.save()
            reaction.message.channel.messages.fetch({ around: reaction.message.id, limit: 1 })
              .then(async msg => {
                let fetchedMsg = msg.first();
                let embedlotery = fetchedMsg?.embeds[0]!
                let fields = embedlotery.fields
                fields[1].name = "🎟️ Entradas: " + loteria!.entradas// agrego una nueva entrada
                fields[5].name = " Primer premio: <:gold:827663569565908993>" + loteria!.total * lotery1
                fields[6].name = " Segundo premio: <:gold:827663569565908993>" + loteria!.total * lotery2
                fields[7].name = " Tercer premio: <:gold:827663569565908993>" + loteria!.total * lotery3
                embedlotery.fields = fields
                reaction.message.edit(embedlotery)
                return true
              })
              .catch(err => {
                console.log(err)
                return false
              })

          } else {
            return false
          }
        })
        .catch(err => {
          console.log(err)
          return false
        })
      return true
    } else {
      member.send("la loteria ya finalizo")
      return false
    }
  }

  public async checkTickets(user: GuildMember) {
    let loteria = await Lotery.findOne({ estado: "Abierta" })
    if (loteria) {
      let comprador = await Balance.findOne({ userName: user.displayName })
      if (comprador && loteria) {
        let participante = loteria.participantes.filter((function (nickname) { return nickname.userName == user.displayName }))
        if (participante.length > 0) {
          let cantidad = participante[0].cantidad
          user.send("Usted tiene comprados " + cantidad + " tickets")
        }
      } else {
        user.send("No tienes tickets comprados")
      }
    } else {
      user.send("La loteria ya finalizo")
    }
  }





  public async CheckloteryFinish(loteryChannel: TextChannel) {
    await Lotery.findOne({ estado: "Abierta" })
      .then(loteria => {
        if (loteria) {
          console.log(loteria)
          let now = moment()
          let fecha = moment(loteria!.cierre, "LLL")
          console.log("se verifico la loteria", now, fecha)
          if (now >= fecha) {
            roll.getwinner(loteria!.participantes, loteryChannel)
            loteria!.estado = "cerrado"
            loteria!.save()

          }
        }
      })
      .catch(err => console.log(err))

  }




}

