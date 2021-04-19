import { Client, Message, TextChannel, MessageEmbed, MessageReaction, EmbedField, User, GuildMember } from "discord.js";
import { cpuUsage } from "process";
import GroupRoll from './models/grouproll'
import * as embeds from './Embeds'
import Balance from './models/balance'
import PcrM from './models/pcrm'
import Stats from './models/stats'

var moment = require('moment-timezone');
moment().tz("America/Argentina/Buenos_Aires").format();

const comisionCarrisM = 0.99
const comisionCarrisR = 0.99
const comision = 0.99
const discordavatar = "https://media1.tenor.com/images/54cc77830f82ef67471d8d868d09ad2f/tenor.gif?itemid=11230336"
const regex = /(\d+)/g;
const erroravatar = "https://i.pinimg.com/originals/4c/22/18/4c2218f5cc96ba76c0e590cd1dadb1bc.gif"

class CheckbalanceResponse {

    canroll: boolean
    embedmessage: MessageEmbed

    constructor(canroll: boolean, embedmessage: MessageEmbed) {
        this.canroll = canroll
        this.embedmessage = embedmessage
    }


}

// pcr miticas + 
export async function pcrm(advertiser: string, vendedor1: string, vendedor2: string, vendedor3: string, vendedor4: string, total: number, reino: string): Promise<boolean> {
    let v1 = await Balance.findOne({ userName: advertiser })
    let v2 = await Balance.findOne({ userName: vendedor1 })
    let v3 = await Balance.findOne({ userName: vendedor2 })
    let v4 = await Balance.findOne({ userName: vendedor3 })
    let v5 = await Balance.findOne({ userName: vendedor4 })
    if (v1 && v2 && v3 && v4 && v5) {
        let pagos = [advertiser, vendedor1, vendedor2, vendedor3, vendedor4]
        for (let vendedor of pagos) {
            let pago = await Balance.findOne({ userName: vendedor })
            pago!.carryMsales = pago?.carryMsales! + 1
            pago!.earnedwhitcarrys = pago!.earnedwhitcarrys + (Math.floor(total * comisionCarrisM) / 5)
            let newbalance = pago?.balance! + (Math.floor(total * comisionCarrisM) / 5)
            pago!.balance! = newbalance
            try {
                await pago!.save()
            } catch (err) {
                console.log(err)
                return false
            }
        }
        let day = moment().format("MMM Do YY");
        let hour = moment().format('HH:mm:ss')
        let newPcr = {
            advertasing: advertiser,
            reino: reino,
            fecha: day.toString() + "  " + hour.toString(),
            vendedor1: vendedor1,
            vendedor2: vendedor2,
            vendedor3: vendedor3,
            vendedor4: vendedor4,
            total: total
        }
        let pcr = new PcrM(newPcr)
        pcr.save()
            .then(async succes => {
                console.log("pcr cargado correctamente")
                let stats = await Stats.findOne({})
                if (stats) {
                    stats.total = Math.floor(stats.total + total)
                    stats.ganancia = Math.floor(stats.ganancia + (total * (1 - comisionCarrisM)))
                    stats.entregado = Math.floor(stats.entregado + (total * comisionCarrisM))
                    stats.save()
                }
                else {
                    let newstat = {
                        total: Math.floor(total),
                        ganancia: Math.floor((total * (1 - comisionCarrisM))),
                        entregado: Math.floor(total * comisionCarrisM)
                    }
                    let stat = new Stats(newstat)
                    stat.save()

                }
            })
            .catch(err => {
                console.log(err)
                return false
            })
        return true

    } else {
        return false
    }
}
// pcr miticas end

// pcr raids

export async function pcrR(advertiser: string, vendedores: string[], total: number, reino: string): Promise<boolean> {
    let adv = await Balance.findOne({ userName: advertiser })
    if (adv) {
        let pagos = [advertiser]
        for (let vendedor of vendedores) {
            let vendedorBalance = await Balance.findOne({ userName: vendedor })
            if (vendedorBalance) {
                pagos.push(vendedorBalance.userName)
            } else {
                return false
            }
        }
        for (let vendedor of pagos) {
            let pago = await Balance.findOne({ userName: vendedor })
            pago!.carryRsales = pago?.carryMsales! + 1
            pago!.earnedwhitcarrys = pago!.earnedwhitcarrys + (Math.floor(total * comisionCarrisR) / pagos.length)
            let newbalance = pago?.balance! + (Math.floor(total * comisionCarrisR) / pagos.length)
            pago!.balance! = newbalance
            try {
                await pago!.save()
            } catch (err) {
                console.log(err)
                return false
            }
        }
        let day = moment().format("MMM Do YY");
        let hour = moment().format('HH:mm:ss')
        let newPcr = {
            advertasing: advertiser,
            reino: reino,
            fecha: day.toString() + "  " + hour.toString(),
            vendedores: vendedores,
            total: total
        }
        let pcr = new PcrM(newPcr)
        pcr.save()
            .then(async succes => {
                console.log("pcr cargado correctamente")
                let stats = await Stats.findOne({})
                if (stats) {
                    stats.total = Math.floor(stats.total + total)
                    stats.ganancia = Math.floor(stats.ganancia + (total * (1 - comisionCarrisM)))
                    stats.entregado = Math.floor(stats.entregado + (total * comisionCarrisM))
                    stats.save()
                }
                else {
                    let newstat = {
                        total: Math.floor(total),
                        ganancia: Math.floor((total * (1 - comisionCarrisM))),
                        entregado: Math.floor(total * comisionCarrisM)
                    }
                    let stat = new Stats(newstat)
                    stat.save()

                }
            })
            .catch(err => {
                console.log(err)
                return false
            })
        return true

    } else {
        return false
    }
}

export async function rollBalance(winner: string, losser: string, total: number): Promise<boolean> {
    let win = await Balance.findOne({ userName: winner })
    let loser = await Balance.findOne({ userName: losser })
    let casino = await Balance.findOne({ userName: "Urlinja-Ragnaros" })
    if (casino && win && loser && win.userName != loser.userName) {
        let newWinnerBalance = win.balance - total + (total * 2 * comision)
        let newLosserBalance = loser.balance - total
        //casino stats beging
        casino.earned = casino.earned + (total * 2 * (1 - comision))
        casino.rolls = casino.rolls + 1
        //casino stats end
        win.rolls = win.rolls + 1
        win.gambled = win.gambled + total
        win.earned = win.earned - total + (total * 2 * comision)
        win.win = win.win + 1
        loser.rolls = loser.rolls + 1
        loser.gambled = loser.gambled + total
        loser.earned = loser.earned - total
        loser.lost = loser.lost + 1
        win.balance = Math.floor(newWinnerBalance)
        loser.balance = Math.floor(newLosserBalance)
        try {
            await loser.save()
            await win.save()
            await casino.save()
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    } else {
        return false
    }
}

export async function rollBalance7(winner: string, losser: string, total: number): Promise<boolean> {
    let win = await Balance.findOne({ userName: winner })
    let loser = await Balance.findOne({ userName: losser })
    let casino = await Balance.findOne({ userName: "Urlinja-Ragnaros" })
    if (casino && win && loser && win.userName != loser.userName) {
        let newWinnerBalance = win.balance - total + (total * 2 * comision)
        let newLosserBalance = loser.balance - total
        casino.earned = casino.earned + (total * 2 * (1 - comision))
        casino.rolls = casino.rolls + 1
        win.rolls = win.rolls + 1
        win.gambled = win.gambled + total
        win.earned = win.earned - total + (total * 2 * comision)
        win.win = win.win + 1
        loser.rolls = loser.rolls + 1
        loser.gambled = loser.gambled + total
        loser.earned = loser.earned - total
        loser.lost = loser.lost + 1
        if (loser.userName === "ThrydiaBot") {
            newWinnerBalance = win.balance - total + (total * 4 * comision)
            newLosserBalance = loser.balance - (total * 3)
            win.earned = win.earned + ((total * 4 * comision) - total)
            loser.earned = loser.earned - (total * 3)
        }
        win.balance = Math.floor(newWinnerBalance)
        loser.balance = Math.floor(newLosserBalance)
        try {
            await loser.save()
            await win.save()
            await casino.save()
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    } else {
        return false
    }
}

export function getBalance(message: Message, member: GuildMember) {
    let mention = message.mentions.members?.first()
    let user = member
    if (mention) {
        user = mention
    }
    Balance.findOne({ userName: user.displayName }).then(
        balance => {
            console.log(balance)
            let embedBalance: MessageEmbed = embeds.balaceCheck
            embedBalance.fields = []
            embedBalance.setDescription("")
            embedBalance.setAuthor(user.displayName, user.user.avatarURL() || discordavatar)
            embedBalance.addField("Balance:", balance?.balance)
            message.channel.send(embedBalance)
        })
        .catch(err => console.log(err))
}


export function getStats(message: Message, member: GuildMember) {
    let mention = message.mentions.members?.first()
    let user = member
    if (mention) {
        user = mention
    }
    Balance.findOne({ userName: user.displayName }).then(
        balance => {
            console.log(balance)
            try {
                if (balance?.rolls! > 0) {
                    let embedStats: MessageEmbed = embeds.balaceCheck
                    embedStats.fields = []
                    embedStats.setAuthor(user.displayName, user.user.avatarURL() || discordavatar)
                    embedStats.addField("Rolls:        ", "🎲" + balance?.rolls, true)
                    embedStats.addField("Total Ganado: ", Math.round(balance?.earned!) + " 💰", true)
                    embedStats.addField("Total jugado: ", Math.round(balance?.gambled!) + " 💰", true)
                    embedStats.addField("Rolls Ganados:", "🎲" + balance?.win, true)
                    embedStats.addField("Rolls Perdidos :", "🎲" + balance?.lost, true)
                    embedStats.addField("% de victorias :", Math.round((balance?.win! * 100) / balance?.rolls!) + "%", true)

                    message.channel.send(embedStats)
                } else {
                    let embedStats: MessageEmbed = embeds.balaceCheck
                    embedStats.fields = []
                    embedStats.setAuthor(user.displayName, erroravatar)
                    embedStats.setDescription("Primero debes hacer una apuesta")
                    message.channel.send(embedStats)
                }
            } catch {
                let embedStats: MessageEmbed = embeds.balaceCheck
                embedStats.fields = []
                embedStats.setAuthor(user.displayName, erroravatar)
                embedStats.setDescription("Error al cargar las estadisticas")
                message.channel.send(embedStats)
            }
        })
        .catch(err => console.log(err))
}


export async function canRoll(message: Message, embedMessage: MessageEmbed, bet: number): Promise<boolean> {
    let canroll = true
    let allfields = embedMessage.fields
    for (let field of allfields) {
        let name = field.name
        let user = await Balance.findOne({ userName: name })
        if (user?.balance! < bet) {
            field.name = "❌" + field.name
            field.value = user?.balance!.toString()!
            console.log(field)
            embedMessage.setDescription("Cancelado, balance insuficiente")
            canroll = false
        } else {
            field.value = user?.balance!.toString()!
        }
    }
    if (canroll) {
        embedMessage.setDescription('tiene 20 sg para aceptar el reto')
    }
    message.edit(embedMessage)
    return canroll
}

export async function nariCanRoll(message: Message, embedMessage: MessageEmbed, bet: number): Promise<boolean> {
    let canroll = true
    let allfields = embedMessage.fields
    for (let field of allfields) {
        let name = field.name
        let user = await Balance.findOne({ userName: name })
        if (user?.balance! < bet) {
            field.name = "❌" + field.name
            field.value = user?.balance!.toString()!
            console.log(field)
            embedMessage.setDescription("Cancelado, balance insuficiente")
            canroll = false
        } else {
            field.value = user?.balance!.toString()!
        }
    }
    if (canroll) {
        embedMessage.setDescription('esperando su eleccion')
    }
    message.edit(embedMessage)
    return canroll
}


export async function canDr(message: Message, embedMessage: MessageEmbed, bet: number): Promise<boolean> {
    let canroll = true
    let allfields = embedMessage.fields
    for (let field of allfields) {
        let name = field.name
        let user = await Balance.findOne({ userName: name })
        if (user?.balance! < bet) {
            field.name = "❌" + field.name
            field.value = user?.balance!.toString()!
            console.log(field)
            embedMessage.setDescription("Cancelado, balance insuficiente")
            canroll = false
        } else {
            field.value = user?.balance!.toString()!
        }
    }
    if (canroll) {
        embedMessage.setDescription('esperando aceptacion')
    }
    message.edit(embedMessage)
    return canroll
}



