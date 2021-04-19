import { Client, Message, TextChannel, MessageEmbed, MessageReaction, EmbedField, User, GuildMember, ReactionEmoji } from "discord.js";
import { cpuUsage } from "process";
import GroupRoll from './models/grouproll'
import * as embeds from './Embeds'
import * as Balance from './balance.controller'
import BalanceModel from "./models/balance";
import Lotery from "./models/lotery";
import lotery from "./models/lotery";
import Participante from "./models/class/participante";
import SingletonLoteria from "./models/class/SingletonLoteria"
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

////// GrouRoll  begin

class Winner {
  message: string;
  winner: GuildMember

  constructor(message: string, winner: GuildMember) {
    this.message = message;
    this.winner = winner;
  }


}

export function getwinner(participantes: Participante[], loteryChannel: TextChannel) {
  let allParticipantes = []
  for (let participante of participantes) {

    for (let i = 0; i < participante.cantidad; i++) {
      allParticipantes.push(participante.userName)
    }

  }
  console.log(allParticipantes)
  for (let i = 0; i < 3; i++) {
    console.log("lenght", allParticipantes.length)
    let indexWinner = Math.floor(Math.random() * (allParticipantes.length - i))
    loteryChannel.send("ganador del puesto " + (i + 1) + ": " + allParticipantes[indexWinner])
    allParticipantes.splice(indexWinner, 1)
  }

}

async function grwinner(allfields: EmbedField[], bet: number, reaction: MessageReaction, embedmessage: MessageEmbed) {
  let winer = " "
  let loser = " "
  let winnerNum = 0
  let loserNum = bet + 1
  let totalPeople = 0
  for (let field of allfields) {
    let user = await BalanceModel.findOne({ userName: field.name })
    if (user?.balance! < bet) {
      field.name = "❌" + field.name
      field.value = "Cancelado, balance insuficiente"
    } else {
      totalPeople = totalPeople + 1
      let roll: number = +field.value.match(regex)?.toString()!
      if (roll > winnerNum) {
        winer = field.name
        winnerNum = roll
      }
      if (roll < loserNum) {
        loser = field.name
        loserNum = roll
      }
    }
  }
  if (totalPeople > 1) {
    let winner = reaction.message.guild?.members.cache.find(user => user.displayName === winer)
    let losser = reaction.message.guild?.members.cache.find(user => user.displayName === loser)
    let total = parseInt((winnerNum - loserNum).toString())
    try {
      let succes = await Balance.rollBalance(winner?.displayName!, losser?.displayName!, total)
      if (succes && winner) {
        let message = winer + " le gana  a: " + loser + ": " + Math.floor(total * comision) + "g"
        embedmessage.setDescription(message)
        embedmessage.fields = allfields!
        embedmessage.setThumbnail(winner.user.avatarURL() || discordavatar)
        reaction.message.edit(embedmessage)
      }
    }
    catch (err) {
      console.log(err)
      allfields = []
      embedmessage!.fields = allfields
      embedmessage!.title = " Ocurrio un error inesperado"
      embedmessage!.setDescription("no se se puedo realizar el roll")
      embedmessage.setThumbnail(erroravatar)
      reaction.message.edit(embedmessage)
    }
  }
  else {
    allfields = []
    embedmessage.fields = allfields
    embedmessage.title = " no hay suficientes participantes"
    embedmessage.setDescription("no se pudieron encontrar participantes para esta ronda")
    embedmessage.setThumbnail(erroravatar)
    reaction.message.edit(embedmessage)
  }
}


async function timeoutandRoll(reaction: MessageReaction, bet: number) {
  setTimeout(() => {
    reaction.message.channel.messages.fetch({ around: reaction.message.id, limit: 1 })
      .then(async msg => {
        let fetchedMsg = msg.first();
        let embedmessage = fetchedMsg?.embeds[0]
        let allfields = embedmessage?.fields
        if (allfields && embedmessage) {
          allfields.shift();
          allfields.forEach((f: any) => f.value = (":game_die:" + Math.floor((Math.random() * bet) + 1).toString()));
          await grwinner(allfields, bet, reaction, embedmessage)

        }
      }
      );
  }, 15000)
}

export function gr(embedMessage: any, reaction: MessageReaction) {

  let betText = embedMessage.title?.match(regex)
  let grouproll
  if (betText) {
    let bet = parseInt(betText.toString())
    GroupRoll.findOne({ embedId: reaction.message.id })
      .then(field => {
        if (!field) {
          let newgrouproll = {
            embedId: reaction.message.id,
            finish: false
          }
          grouproll = new GroupRoll(newgrouproll)
          grouproll.save()
            .then(succes => {
              timeoutandRoll(reaction, bet)
            }
            )
            .catch(err => console.log(err))

        } else {
          console.log("new entry")
        }
      })
      .catch(err => console.log(err))

  }
}

async function rollwinner(allfields: EmbedField[], message: Message, bet: number): Promise<GuildMember> {
  let winer = " "
  let loser = " "
  let winnerNum = 0
  let loserNum = 101
  allfields.forEach(element => {
    let roll: number = +element.value.match(regex)?.toString()!
    if (roll > winnerNum) {
      winer = element.name
      winnerNum = roll
    }
    if (roll < loserNum) {
      loser = element.name
      loserNum = roll
    }
  })
  let winner = message.guild?.members.cache.find(user => user.displayName === winer)
  let losser = message.guild?.members.cache.find(user => user.displayName === loser)
  try {
    let succes = await Balance.rollBalance(winner?.displayName!, losser?.displayName!, bet)
    if (succes && winner) {
      return winner
    } else {
      return null as any
    }
  } catch (err) {
    return null as any
  }
}


export async function roll(embedmessage: MessageEmbed, message: Message) {
  let betText = embedmessage.title?.match(regex)?.pop()
  if (betText) {
    let bet = parseInt(betText.toString())
    let allfields = embedmessage.fields
    allfields.forEach((f: any) => {
      f.value = (":game_die:" + Math.floor((Math.random() * 100) + 1).toString());
    })
    if (allfields[0].value !== allfields[1].value) {
      rollwinner(allfields, message, bet)
        .then(winner => {
          console.log("winner", winner)
          embedmessage.setDescription(winner.displayName + " gana un total de: " + Math.floor(bet * 2 * comision) + "g")
          embedmessage.fields = allfields
          embedmessage.setThumbnail(winner.user.avatarURL() || discordavatar)
          message.edit(embedmessage)
        })
        .catch(err => {
          console.log(err)
          embedmessage.setDescription(" no se pudo realizar el roll")
          embedmessage.setThumbnail(erroravatar)
          embedmessage.fields = []
          message.edit(embedmessage)
        })
    } else {
      embedmessage.setDescription("Empate!")
      embedmessage.setThumbnail(erroravatar)
      message.edit(embedmessage)
    }
  }
}


export function cancelRoll(embedmessage: MessageEmbed, message: Message) {

  embedmessage.setDescription('~~Roll cancelado!~~')
  let allfields = embedmessage.fields
  allfields.forEach(f => {
    f.value = ":game_die: ~~Cancelado~~";
    f.name = "~~" + f.name + "~~"
  })
  message.edit(embedmessage)
}

export function cancelRollTimeout(message: Message) {
  setTimeout(() => {
    message.channel.messages.fetch({ around: message.id, limit: 1 })
      .then(msg => {
        let embedmessage = msg.first()?.embeds[0]
        if (embedmessage && embedmessage.description === 'esperando aceptacion') {
          cancelRoll(embedmessage!, message)
        }
      })
  }, 35000)
}

export async function dr(message: Message) {
  let embed = await message.channel.messages.fetch({ around: message.id, limit: 1 })
  let embedmessage = embed.first()?.embeds[0]!
  embedmessage.setDescription('Death roll aceptado!')
  message.edit(embedmessage)
  try {
    let user1name = embedmessage.fields[0].name
    let user2name = embedmessage.fields[1].name
    let user1 = message.guild?.members.cache.find(user => user.displayName === user1name)!
    let user2 = message.guild?.members.cache.find(user => user.displayName === user2name)!
    let betText = embedmessage.title?.match(regex)?.pop()!
    let bet = parseInt(betText.toString())
    let roll = Math.floor((Math.random() * bet) + 1)
    let rollmesage = await message.channel.send(`${user2} tira los dados y obtiene:  **${roll}**`)
    await rollmesage.react("🎲")
    drroll(rollmesage, user1, user2, roll, bet)


  } catch (err) {
    console.log(err)
    embedmessage!.fields = []
    embedmessage!.title = " Ocurrio un error inesperado"
    embedmessage!.setDescription("no se se puedo realizar el Death Roll")
    embedmessage.setThumbnail(erroravatar)
    message.edit(embedmessage)
  }

}


async function drroll(rollmesage: Message, user1: GuildMember, user2: GuildMember, lastroll: number, bet: number) {
  if (lastroll === 1) {
    let drembed: MessageEmbed = embeds.dr
    try {
      await Balance.rollBalance(user1.displayName, user2.displayName, bet)

      drembed.setTitle('Death Roll ' + bet + ' gold')
      drembed.setDescription(`${user2} tira los dados y obtiene: 1`)
      drembed.fields = []
      drembed.addField('\u200B', `${user1}  Gana ${Math.floor(bet * 2 * comision)}  \n  ${user2}  Pierde ${bet} `, false)
      drembed.setThumbnail(user1.user.avatarURL() || discordavatar)
      rollmesage.channel.send(drembed)
    } catch (err) {
      console.log(err)
      drembed.fields = []
      drembed.title = " Ocurrio un error inesperado"
      drembed.setDescription("error al calcular nuevos balances, por favor contactar un administrador")
      rollmesage.channel.send(drembed)

    }
  } else {

    rollmesage.awaitReactions((reaction, user) => user == user2.user && (reaction.emoji.name == '🎲'),
      { max: 1, time: 15000 }).then(async collected => {
        if (collected.first()!.emoji.name == '🎲') {
          let roll = Math.floor((Math.random() * lastroll) + 1)
          let rollmessageNew = await rollmesage.channel.send(`${user1} tira los dados y obtiene: **${roll}**`)
          await rollmessageNew.react("🎲")

          drroll(rollmessageNew, user2, user1, roll, bet)
        }
      }).catch(async () => {
        let roll = Math.floor((Math.random() * lastroll) + 1)
        let rollmessageNew = await rollmesage.channel.send(`${user1} tira los dados y obtiene:  **${roll}**`)
        await rollmessageNew.react("🎲")
        drroll(rollmessageNew, user2, user1, roll, bet)

      });
  }

}

export async function rollawaitreaction(message: Message, embedmessage: MessageEmbed) {




}


export async function nariroll(embedmessage: MessageEmbed, message: Message, election: string, user: GuildMember) {
  let betText = embedmessage.title?.match(regex)?.pop()
  if (betText) {
    let bet = parseInt(betText.toString())
    let allfields = embedmessage.fields
    let totalroll = 0
    embedmessage.setDescription(message.member?.displayName + " apuesta " + betText)
    allfields.forEach((f: any) => {
      f.value = (":game_die:" + Math.floor((Math.random() * 6) + 1).toString());
      f.name = "ThrydiaBot"
      totalroll = totalroll + +f.value.match(regex)?.toString()!
    })
    narirollwinner(election, message, bet, totalroll, user)
      .then(winner => {
        console.log("winner", winner)
        embedmessage.setDescription(winner.displayName + " gana un total de: " + Math.floor((bet * 2) * comision) + "g")
        if (election === "7" && winner.displayName !== "ThrydiaBot") {
          embedmessage.setDescription(winner.displayName + " gana un total de: " + Math.floor((bet * 4) * comision) + "g")
        }
        embedmessage.fields = allfields
        embedmessage.setThumbnail(winner.user.avatarURL() || discordavatar)
        message.edit(embedmessage)
      })
      .catch(err => {
        console.log(err)
        embedmessage.setDescription(" no se pudo realizar el roll")
        embedmessage.fields = []
        embedmessage.setThumbnail(erroravatar)
        message.edit(embedmessage)
      })

  }
}


async function narirollwinner(election: string, message: Message, bet: number, totalRoll: number, user: GuildMember): Promise<GuildMember> {
  let winer = " "
  let loser = " "
  let winnerNum = 0
  let loserNum = 101
  let winner = message.guild?.members.cache.find(user => user.user.username === "ThrydiaBot")!
  let losser = message.guild?.members.cache.find(user => user.user.username === "ThrydiaBot")!
  console.log(winner, losser)

  if ((election === "over" && totalRoll > 7) || (election === "under" && totalRoll < 7) || (election === "7" && totalRoll === 7)) {
    winner = user
  } else {
    losser = user
  }
  try {
    let succes = false
    if (election === "7") {
      succes = await Balance.rollBalance7(winner?.displayName!, losser?.displayName!, bet)
    } else {
      succes = await Balance.rollBalance(winner?.displayName!, losser?.displayName!, bet)
    }
    if (succes && winner) {
      return winner
    } else {
      return null as any
    }
  } catch (err) {
    return null as any
  }
}


