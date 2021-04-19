import { config } from "dotenv";
config();
import { Client, Message, TextChannel, MessageEmbed, MessageReaction, GuildMember, Guild } from "discord.js";
const Discord = require('discord.js');
import { prefix } from "./config.json";
import axios from 'axios';
import * as embeds from './Embeds'
import * as roll from './roll.controller'
import * as db from './mongodb'
import Balance from './models/balance'
import balance from "./models/balance";
import * as balanceController from "./balance.controller";
import SingletonLoteria from "./models/class/SingletonLoteria";

var moment = require('moment-timezone');
moment().tz("America/Argentina/Buenos_Aires").format();
const GphApiClient = require("giphy-js-sdk-core");
const { GIPHY_TOKEN } = process.env;
const personaje = []
const client: Client = new Client();
const giphy = GphApiClient(GIPHY_TOKEN);
const discordavatar = "https://media1.tenor.com/images/54cc77830f82ef67471d8d868d09ad2f/tenor.gif?itemid=11230336"
let index = 0;
let emb = "embed"

const erroravatar = "https://i.pinimg.com/originals/4c/22/18/4c2218f5cc96ba76c0e590cd1dadb1bc.gif"


client.once("ready", async () => {
  console.log("Bot is ready!");
  db.startConnecion();
  let thrydia = client.guilds.cache.find(x => x.id === "824854142127177730") as Guild
  let loteryChannel = thrydia.channels.cache.find(x => x.id === "827634046771003422") as TextChannel
  const singletonLotery = SingletonLoteria.getInstance();
  let interval = setInterval(singletonLotery.CheckloteryFinish, 60000, loteryChannel)

});
client.on("guildMemberAdd", member => {
  let invitado = member.guild.roles.cache.find(r => r.name === "♖ │Invitado │♖");
  // let welcomeChanel = member.guild.channels.cache.find(x => x.id === "723311059200639047") as TextChannel
  member.roles.add(invitado!)

});

client.on("message", async (message: Message) => {

  if (message.guild) {
    let bolsaChannel = message.guild.channels.cache.find(x => x.id === "723311059200639047") as TextChannel
    let gamblingChannel = message.guild.channels.cache.find(x => x.id === "760602851444523028") as TextChannel
    let balancelogs = message.guild.channels.cache.find(x => x.id === "827418540588007424") as TextChannel
    let discordUser = message.member
    var regex = /(\d+)/g;
    let aPagar = 0;
    let bolsaActual = 0;

    // PCR M+ 
    if (message.channel.id === "825965825277820929") {
      if (message.author.username !== "ThrydiaBot") {
        let pcr = message.content.split('\n')
        let advertiser = pcr[0]
        let totalpcr = parseInt(pcr[1])
        let reino = pcr[2]
        let vendedor1 = pcr[3]
        let vendedor2 = pcr[4]
        let vendedor3 = pcr[5]
        let vendedor4 = pcr[6]
        let pcrdone = await balanceController.pcrm(advertiser, vendedor1, vendedor2, vendedor3, vendedor4, totalpcr, reino)
        if (pcrdone) {
          message.channel.send(message.author.username + " su pcr se ha subido correctamente")
        } else {
          message.channel.send(message.author.username + " hubo un error al subir su pcr, por favor revise los datos")
        }
      }

    }

    // pcr m+ fin 

    // pcr raids

    if (message.channel.id === "826907718828032050") {
      if (message.author.username !== "ThrydiaBot") {
        let pcr = message.content.split('\n')
        let advertiser = pcr[0]
        let totalpcr = parseInt(pcr[1])
        let reino = pcr[2]
        let vendedores = []
        for (var i = 3; i < pcr.length; i++) {
          vendedores.push(pcr[i])
        }
        let pcrdone = await balanceController.pcrR(advertiser, vendedores, totalpcr, reino)
        if (pcrdone) {
          message.channel.send(message.author.username + " su pcr se ha subido correctamente")
        } else {
          message.channel.send(message.author.username + " hubo un error al subir su pcr, por favor revise los datos")
        }
      }

    }

    //pcr raid fin

    // register channel delete messages
    if (message.channel.id === "825866980933894194" && message.author.username !== "ThrydiaBot" && !message.content.startsWith(`${prefix}`)) {
      message.delete()
      let mensajeBot = await message.channel.send("no escribas aca hijo de mil puta")
      setTimeout(() => {
        mensajeBot.delete()
      }, 3000);



    }

    // GROUP ROLL 
    if (message.content.startsWith('.gr')) {
      let titlebet = message.content.split(' ').pop()
      titlebet = titlebet?.replace("k", "000")
      let bet = parseInt(titlebet?.match(regex)?.pop()!.toString()!, 10)
      if (bet >= 1000 && bet <= 10000000) {
        let embedmessage = embeds.gr
        embedmessage.setTitle("Group roll " + bet)
        message.channel.send(embedmessage).then(function (message) {
          message.react("👍")
        }).catch(function () {

        });
      } else {
        let embedmessage = embeds.roll
        embedmessage.setThumbnail(erroravatar)
        embedmessage.setTitle("Group roll ")
        embedmessage.setDescription("Roll cancelado, la apuesta minima es 1000 de oro")
        embedmessage.fields = []
        message.channel.send(embedmessage)
      }
    }

    if (message.content.startsWith('.selectrole')) {
      let embedmessage = embeds.seleccionrole
      message.channel.send(embedmessage).then(function (message) {
        message.react("825868585330278410")
        message.react("825868124108226561")
        message.react("825868410013089813")
      }).catch(function () {
        console.log("error al enviar el mensaje")
      });

    }

    // ROLL 1VS1
    if (message.content.startsWith('.roll')) {
      let user1 = message.mentions.members?.first()
      let titlebet = message.content.split(' ').pop()
      titlebet = titlebet?.replace("k", "000")
      let bet = parseInt(titlebet?.match(regex)?.pop()!.toString()!, 10)
      if (user1 && bet && user1.displayName !== "ThrydiaBot") {
        if (bet >= 500 && bet <= 10000000) {
          let embedmessage = new MessageEmbed()
          embedmessage.setColor('#0x0099ff')
          embedmessage.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
          embedmessage.setDescription('tiene 20 sg para aceptar el reto')
          embedmessage.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
          embedmessage.setTimestamp()
          embedmessage.setFooter('reacciona para aceptar el reto!');
          embedmessage.setTitle("1vs1 roll - " + bet)
          embedmessage.setDescription("checkeando balances....")
          embedmessage.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
          embedmessage.fields = [];
          embedmessage.addField(user1?.displayName, " balance: cargando....", false)
          embedmessage.addField(message.member?.displayName, "balance: cargando....", false)
          message.channel.send(embedmessage)
            .then(async function (message) {
              let canroll = await balanceController.canRoll(message, embedmessage, bet)
              message.react("👍").then(reaction => roll.cancelRollTimeout(message))
              message.react("❌")
              message.awaitReactions((reaction, user) => user == user1?.user && (reaction.emoji.name == '👍' || reaction.emoji.name == '❌') && embedmessage.description === 'tiene 20 sg para aceptar el reto',
                { max: 1, time: 35000 }).then(async collected => {
                  if (collected.first()!.emoji.name == '👍') {
                    roll.roll(embedmessage, message)
                  }
                  if (collected.first()!.emoji.name == '❌') {
                    roll.cancelRoll(embedmessage, message)
                  }
                }
                )
                .catch(async () => {
                  roll.cancelRoll(embedmessage, message)

                })
            }).catch(function (err) {
              console.log(err)

            });
        } else {
          let embedmessage = embeds.roll
          embedmessage.setThumbnail(erroravatar)
          embedmessage.setTitle("1vs1 roll ")
          embedmessage.setDescription("Roll cancelado, la apuesta minima es 500 de oro")
          embedmessage.fields = []
          message.channel.send(embedmessage)
        }
      }
    }


    // STATS
    if (message.content.startsWith('.stats')) {

      let user = message.member!
      balanceController.getStats(message, user)


    }


    if (message.content.startsWith(`${prefix}`)) {
      let manco = message.member!.guild.roles.cache.find(r => r.name === "500- io")!;
      let role500 = message.member!.guild.roles.cache.find(r => r.name === "500+ io")!;
      let role1000 = message.member!.guild.roles.cache.find(r => r.name === "1000+ io")!;
      let role1500 = message.member!.guild.roles.cache.find(r => r.name === "1500+ io")!;
      let role2000 = message.member!.guild.roles.cache.find(r => r.name === "2000+ io")!;
      let role2500 = message.member!.guild.roles.cache.find(r => r.name === "2500+ io")!;
      let role3000 = message.member!.guild.roles.cache.find(r => r.name === "3000+ io")!;
      let miembro = message.guild!.roles.cache.find(r => r.name === "∅ │Miembro │∅");
      let mensaje = message.content.split('/')
      let discordUser = message.member
      let region = mensaje[4];
      let server = mensaje[5];
      let name = mensaje[6].split('?')[0]
      //let name = mensaje[6];
      //    let gambler = message.guild.roles.cache.find(r => r.name === "Gambler");

      axios.get('https://raider.io/api/v1/characters/profile?region=' + region + '&realm=' + server + '&name=' + name + '&fields=mythic_plus_scores_by_season%3Acurrent')
        .then(async (user: any) => {
          console.log(user)
          let name = user.data.name + "-" + user.data.realm
          let clase = user.data.class
          let rolclass = message.member!.guild.roles.cache.find(r => r.name === clase)!;
          let role = user.data.active_spec_role
          let rolrole = message.member!.guild.roles.cache.find(r => r.name === role)!;
          let displayname = await Balance.findOne({ userName: name })
          let memberName = message.member?.displayName
          let actualname = await Balance.findOne({ userName: memberName })
          if (!displayname && !actualname) {
            let newBalance = {
              userName: name,
              balance: 0,
              rolls: 0,
              gambled: 0,
              earned: 0,
              win: 0,
              lost: 0,
              carryMsales: 0,
              carryRsales: 0,
              earnedwhitcarrys: 0
            }
            let balance = new Balance(newBalance)
            balance.save().then(succes => {
              let invitado = message.guild!.roles.cache.find(r => r.name === "♖ │Invitado │♖");
              let gambler = message.guild!.roles.cache.find(r => r.name === "Gambler");
              message.member?.setNickname(name)
              message.member?.roles.remove(invitado!)
              //message.member?.roles.add(gambler!)

              let score = user.data.mythic_plus_scores_by_season[0].scores.all
              let discordUser = message.member!
              if ((score > -1) && (score < 500)) {
                discordUser.roles.add(manco);
                discordUser.roles.remove(role1000)
                discordUser.roles.remove(role500)
                discordUser.roles.remove(role1500)
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role2500)
                discordUser.roles.remove(role3000)
                message.member?.send(discordUser.displayName + " Rango actualizado correctamente. Score actual " + score + ", rango asignado -> 500-");

              }
              if ((score >= 500) && (score < 1000)) {
                discordUser.roles.add(role500);
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role1000)
                discordUser.roles.remove(role1500)
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role2500)
                discordUser.roles.remove(role3000)
                message.member?.send(discordUser.displayName + " Rango actualizado correctamente. Score actual " + score + ", rango asignado -> 500+");
              }
              if ((score >= 1000) && (score < 1500)) {
                discordUser.roles.add(role1000);
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role500)
                discordUser.roles.remove(role1500)
                discordUser.roles.remove(role2500)
                discordUser.roles.remove(role3000)
                message.member?.send(discordUser.displayName + " Rango actualizado correctamente. Score actual " + score + ", rango asignado -> 1000+");
              }
              if ((score >= 1500) && (score < 2000)) {
                discordUser.roles.add(role1500);
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role500)
                discordUser.roles.remove(role1000)
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role2500)
                discordUser.roles.remove(role3000)
                message.member?.send(discordUser.displayName + " Rango actualizado correctamente. Score actual " + score + ", rango asignado -> 1500+");
              }

              if ((score >= 2000) && (score < 2500)) {
                discordUser.roles.add(role2000);
                discordUser.roles.remove(role500)
                discordUser.roles.remove(role1000)
                discordUser.roles.remove(role1500)
                discordUser.roles.remove(role2500)
                discordUser.roles.remove(role3000)

                message.member?.send(discordUser.displayName + " Rango actualizado correctamente. Score actual " + score + ", rango asignado -> 2000+");

              }
              if ((score > 2500) && (score < 3000)) {
                discordUser.roles.add(role2500);
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role500)
                discordUser.roles.remove(role1000)
                discordUser.roles.remove(role1500)
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role3000)

                message.member?.send(discordUser.displayName + " Rango actualizado correctamente. Score actual " + score + ", rango asignado -> 2500+");

              }
              if (score >= 3000) {
                discordUser.roles.add(role3000);
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role500)
                discordUser.roles.remove(role1000)
                discordUser.roles.remove(role1500)
                discordUser.roles.remove(role2000)
                discordUser.roles.remove(role2500)
                message.member?.send(discordUser.displayName + " Rango actualizado correctamente. Score actual " + score + ", rango asignado -> 3000+");

              }

              discordUser.roles.add(miembro!);
              discordUser.roles.add(rolclass);
              discordUser.roles.add(rolrole);

              message.delete()

            })
              .catch(err => {
                console.log(err)
                message.member?.send("error al crear su perfil, comuniquese con un administrador")
              })
          } else {
            message.delete()
            message.member?.send(`Usted ya se encuentra registrado si desea cambiar el nombre, por favor contactar un administrador `)
          }
        })
        .catch(err => console.log(err))
    }


    //set balance
    if (message.content.startsWith('.setbalance')) {
      if (message.channel.id === "827042366224334878") {
        let member = message.member!
        let goldColector = member.guild.roles.cache.find(r => r.name === "CasinoStaff")!
        let newbalance = parseInt(message.content.match(regex)?.pop()?.toString()!)
        if (member.roles.cache.has(goldColector.id)) {
          let user = message.mentions.members?.first()!
          Balance.findOneAndUpdate({ userName: user.displayName }, { balance: newbalance }).then(
            balance => {
              message.channel.send(`${member} actualiza el balance de ${user} nuevo balance: ${newbalance}`)
              balancelogs.send((`${member} actualiza el balance de ${user} nuevo balance: ${newbalance}`))
            })
            .catch(err => console.log(err))
        }
      }
    }

    if (message.content.startsWith('.total')) {
      let member = message.member!
      let goldColector = member.guild.roles.cache.find(r => r.name === "CasinoStaff")!
      if (message.channel.id === "827042366224334878") {
        if (member.roles.cache.has(goldColector.id)) {
          let balances = await balance.find()
          let total = 0
          for (let b of balances) {
            total = total + b.balance
          }
          message.channel.send("el oro en balance es: " + total)
        }
      }
    }


    if (message.content.startsWith('.addbalance')) {
      if (message.channel.id === "827042366224334878") {
        let member = message.member!
        let goldColector = member.guild.roles.cache.find(r => r.name === "CasinoStaff")!
        let newbalance = parseInt(message.content.match(regex)?.pop()?.toString()!)
        if (member.roles.cache.has(goldColector.id)) {
          let user = message.mentions.members?.first()!
          let userBalance = await Balance.findOne({ userName: user.displayName })
          if (userBalance) {
            userBalance.balance = userBalance.balance + newbalance
            userBalance.save().then(async succes => {
              message.channel.send(`${member} agrega ${newbalance}g a ${user}`)
              balancelogs.send(`${member} agrega ${newbalance}g a ${user}`)
              let balanceckeck = await message.channel.send(`.b ${user}`)
              balanceckeck.delete()
            }).catch(err => console.log(err))
          } else {
            message.channel.send("no se pudo encontrar el usuario")
          }

        }
      }
    }

    // restar balance
    if (message.content.startsWith('.subbalance')) {
      if (message.channel.id === "827042366224334878") {
        let member = message.member!
        let goldColector = member.guild.roles.cache.find(r => r.name === "CasinoStaff")!
        let newbalance = parseInt(message.content.match(regex)?.pop()?.toString()!)
        if (member.roles.cache.has(goldColector.id)) {
          let user = message.mentions.members?.first()!
          let userBalance = await Balance.findOne({ userName: user.displayName })
          if (userBalance) {
            userBalance.balance = userBalance.balance - newbalance
            userBalance.save().then(async succes => {
              message.channel.send(`${member} le resta ${newbalance}g a ${user}`)
              balancelogs.send(`${member} le resta ${newbalance}g a ${user}`)
              let balanceckeck = await message.channel.send(`.b ${user}`)
              balanceckeck.delete()
            }).catch(err => console.log(err))
          } else {
            message.channel.send("no se pudp encontrar el usuario")
          }

        }
      }
    }
    // LOTERIA
    if (message.content.startsWith('.loteria')) {
      if (message.channel.id === "827634046771003422") {
        const singletonLotery = SingletonLoteria.getInstance();
        await singletonLotery.createLotery(message)
      }
    }

    // DEATH ROLL
    if (message.content.startsWith('.dr')) {
      let titlebet = message.content.split(' ').pop()
      titlebet = titlebet?.replace("k", "000")
      let bet = parseInt(titlebet?.match(regex)?.pop()!.toString()!, 10)
      let user1 = message.mentions.members?.first()
      if (user1 && bet) {
        if (user1 !== message.member) {

          if (bet >= 2000 && bet <= 10000000) {
            let embedmessage = embeds.dr
            embedmessage.setTitle("Death Roll - " + bet)
            embedmessage.setDescription("checkeando balances....")
            embedmessage.setColor('#0x0099ff')
            embedmessage.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
            embedmessage.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
            embedmessage.setTimestamp()
            embedmessage.setFooter('reacciona para aceptar el reto!')
            embedmessage.fields = [];
            embedmessage.addField(user1?.displayName, " balance: cargando....", false)
            embedmessage.addField(message.member?.displayName, "balance: cargando....", false)
            message.channel.send(embedmessage)
              .then(async function (message) {
                let canroll = await balanceController.canDr(message, embedmessage, bet)
                message.react("👍").then(reaction => roll.cancelRollTimeout(message))
                message.react("❌")
                message.awaitReactions((reaction, user) => user == user1?.user && (reaction.emoji.name == '👍' || reaction.emoji.name == '❌') && embedmessage.description === 'esperando aceptacion',
                  { max: 1, time: 35000 }).then(async collected => {
                    if (collected.first()!.emoji.name == '👍') {
                      roll.dr(message)
                    }
                    if (collected.first()!.emoji.name == '❌') {
                      roll.cancelRoll(embedmessage, message)
                    }
                  }
                  )
                  .catch(async () => {
                    roll.cancelRoll(embedmessage, message)

                  })

              }).catch(function () {

              });

          } else {
            let embedmessage = new MessageEmbed()
            embedmessage.setTitle("Death Roll ")
            embedmessage.setColor('#0x0099ff')
            embedmessage.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
            embedmessage.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
            embedmessage.setTimestamp()
            embedmessage.setFooter('reacciona para aceptar el reto!');
            embedmessage.setDescription("Roll cancelado, la apuesta minima es 2000 de oro y maxima 10000000")
            embedmessage.fields = []
            message.channel.send(embedmessage)
          }
        } else {
          let embedmessage = new MessageEmbed()
          embedmessage.setTitle("Death Roll ")
          embedmessage.setDescription("Roll cancelado, no puedes rolearte a ti mismo")
          embedmessage.setThumbnail("https://media.tenor.com/images/15bb5fe535b039fdbc240b0d44cffaaa/tenor.gif")
          embedmessage.setColor('#0x0099ff')
          embedmessage.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
          embedmessage.setTimestamp()
          embedmessage.fields = []
          message.channel.send(embedmessage)
        }

      }
    }

    // Juego Siete
    if (message.content.startsWith('.siete')) {
      let user1 = message.member
      let titlebet = message.content.split(' ').pop()
      titlebet = titlebet?.replace("k", "000")
      let bet = parseInt(titlebet?.match(regex)?.pop()!.toString()!, 10)
      console.log(bet)
      if (bet && bet >= 1000 && bet <= 1000000) {
        let embedmessage = new MessageEmbed()
        embedmessage.setTitle("Siete - " + bet)
        embedmessage.setColor('#0x0099ff')
        embedmessage.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
        embedmessage.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
        embedmessage.setTimestamp()
        embedmessage.setFooter('reacciona tu eleccion!');
        embedmessage.setDescription("checkeando balances....")
        embedmessage.fields = [];
        embedmessage.addField("ThrydiaBot", " balance: cargando....", false)
        embedmessage.addField(message.member?.displayName, "balance: cargando....", false)
        let newmessage = await message.channel.send(embedmessage)
        await balanceController.nariCanRoll(newmessage, embedmessage, bet)
        await newmessage.react("⬆️")
        newmessage.awaitReactions((reaction, user) => user == user1?.user && (reaction.emoji.name == '⬆️' || reaction.emoji.name == '⬇️' || reaction.emoji.name == '7️⃣' || reaction.emoji.name == '❌') && embedmessage.description === 'esperando su eleccion',
          { max: 1, time: 15000 }).then(async collected => {
            if (collected.first()!.emoji.name == '⬆️') {
              roll.nariroll(embedmessage, newmessage, "over", user1!)
            }
            if (collected.first()!.emoji.name == '⬇️') {
              roll.nariroll(embedmessage, newmessage, "under", user1!)
            }
            if (collected.first()!.emoji.name == '7️⃣') {
              roll.nariroll(embedmessage, newmessage, "7", user1!)
            }
            if (collected.first()!.emoji.name == '❌') {
              roll.cancelRoll(embedmessage, newmessage)
            }
          }
          )
          .catch(async () => {
            roll.cancelRoll(embedmessage, message)
          })
        await newmessage.react("⬇️")
        await newmessage.react("7️⃣")
        await newmessage.react("❌")
      } else {
        let embedmessage = embeds.roll
        embedmessage.setTitle("Nari roll ")
        embedmessage.setDescription("Roll cancelado, apuesta minima es 1000 de oro, apuesta maxima 1M")
        embedmessage.setThumbnail(erroravatar)
        embedmessage.fields = []
        message.channel.send(embedmessage)

      }

    }

    // SHOW BALANCE
    if (message.content.startsWith('.b')) {
      let user = message.member!
      balanceController.getBalance(message, user)
    }
  }
});
client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.channel.id === "825866980933894194") {
    let dps = reaction.message.member!.guild.roles.cache.find(r => r.name === "DPS")!;
    let heal = reaction.message.member!.guild.roles.cache.find(r => r.name === "HEALING")!;
    let tank = reaction.message.member!.guild.roles.cache.find(r => r.name === "TANK")!;
    if ((user.username) && (user.username !== "ThrydiaBot")) {
      let guildmember = reaction.message.guild?.members.cache.find(member => member.user === user)!
      guildmember.roles.remove(dps)
      guildmember.roles.remove(tank)
      guildmember.roles.remove(heal)

      if (reaction.emoji.name === 'rolehealer') {
        guildmember.roles.add(heal);
        guildmember.send("Roles actualizados, ahora eres Heal")
      }
      if (reaction.emoji.name === 'roledps') {
        guildmember.roles.add(dps);
        guildmember.send("Roles actualizados, ahora eres DPS")
      }
      if (reaction.emoji.name === 'roletank') {
        guildmember.roles.add(tank);
        guildmember.send("Roles actualizados, ahora eres Tank")
      }
      reaction.users.remove(user.id);
    }
  }
  if (reaction.emoji.name === '👍' || reaction.emoji.name === "❌") {
    if ((user.username) && (user.username !== "ThrydiaBot")) {
      let guildmember = reaction.message.guild?.members.cache.find(member => member.user === user)
      let nickname = guildmember?.displayName
      let hour = moment().format('LT');
      reaction.message.channel.messages.fetch({ around: reaction.message.id, limit: 1 })
        .then(msg => {
          let fetchedMsg = msg.first();
          let embedmessage = fetchedMsg?.embeds[0]
          // GROUP ROLL REACTIONS!
          if (embedmessage && embedmessage.description === 'el roll comenzara en 20sg' && reaction.emoji.name === "👍") {
            let userField = embedmessage.fields.find(e => e.name === nickname)
            if (!userField) {
              embedmessage.fields.push({ name: nickname!, value: "pendiente", inline: false, })
              reaction.message.edit(embedmessage)
                .then(edited => (
                  roll.gr(embedmessage, reaction)
                ))
                .catch(err => console.log(err))
            }
          }// GROUP ROLL REACTIONS END

        });
    }
  }

  // loteria 
  if (reaction.message.channel.id === "827634046771003422") {
    let guildmember = reaction.message.guild?.members.cache.find(member => member.user === user)!
    if ((user.username) && (user.username !== "ThrydiaBot")) {
      const singletonLotery = SingletonLoteria.getInstance();
      if (reaction.emoji.name === "🎟️") {
        singletonLotery.addTicketLotery(reaction, guildmember)
      }
      if (reaction.emoji.name === "❌") {
        singletonLotery.removeTicketsLotery(reaction, guildmember)
      }
      if (reaction.emoji.name === "❓") {
        singletonLotery.checkTickets(guildmember)
      }
      reaction.users.remove(user.id)

    }
  }

  if (reaction.partial) {

    try {
      await reaction.fetch();
    } catch (error) {
      console.log('Something went wrong when fetching the message: ', error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }
  // Now the message has been cached and is fully available
  //	console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
  // The reaction is now also fully available and the properties will be reflected accurately:
  //	console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
});

client.on('messageReactionRemove', (reaction, user) => {
  let member = reaction.message.guild?.members.cache.find(usuario => usuario.user === user)!
  if (member) {
    reaction.message.channel.messages.fetch({ around: reaction.message.id, limit: 1 })
      .then(msg => {
        let fetchedMsg = msg.first();
        let embedmessage = fetchedMsg?.embeds[0]
        if (embedmessage && embedmessage.description === 'el roll comenzara en 20sg') {
          let buscar = embedmessage.fields.findIndex((field: any) => field.name === member.displayName);
          if (buscar > 0) {
            embedmessage.fields.splice(buscar, 1);
            reaction.message.edit(embedmessage)
          }
        }
      });
  }
}

);



client.login(process.env.TOKEN);

  // if (message.content.startsWith(`${prefix}`)) {
  //   let mensaje = message.content.split('/')
  //   let discordUser = message.member
  //   region= mensaje[4];
  //   server= mensaje[5];
  //   name = mensaje[6];
  //   
  //   let role500 = message.guild.roles.find(r => r.name === "2500+");
  //   let role1000 = message.guild.roles.find(r => r.name === "2750+");
  //   let role1500 = message.guild.roles.find(r => r.name === "2900+");
  //   let role2000 = message.guild.roles.find(r => r.name === "3000+");
  //   let role2500 = message.guild.roles.find(r => r.name === "3200+");
  //   let role3000 = message.guild.roles.find(r => r.name === "3400+");
  //   axios.get('https://raider.io/api/v1/characters/profile?region='+region+'&realm='+server+'&name='+name+'&fields=mythic_plus_scores_by_season%3Acurrent')
  //   .then((response: any) => {
  //     console.log(response.data.mythic_plus_scores_by_season[0].scores.all);
  //     let score = response.data.mythic_plus_scores_by_season[0].scores.all
  //     if ((score > 2000) && (score < 2500)) { 
  //       discordUser.roles.add(role2000);
  //       discordUser.roles.remove(role500)
  //       discordUser.roles.remove(role1000)
  //       discordUser.roles.remove(role1500)
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role2500)
  //       discordUser.roles.remove(role3000)
  //       message.channel.send( discordUser +" Rango actualizado correctamente. Score actual "+ score + ", rango asignado -> 500+");

  //     }
  //     if ((score >= 2500) && (score < 2750)) { 
  //       discordUser.roles.add(role500);
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role1000)
  //       discordUser.roles.remove(role1500)
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role2500)
  //       discordUser.roles.remove(role3000)
  //       message.channel.send( discordUser +" Rango actualizado correctamente. Score actual "+ score + ", rango asignado -> 2500+");
  //     }
  //     if ((score >= 2750) && (score < 2900)) { 
  //       discordUser.roles.add(role1000);
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role500)
  //       discordUser.roles.remove(role1500)
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role2500)
  //       discordUser.roles.remove(role3000)
  //       message.channel.send( discordUser +" Rango actualizado correctamente. Score actual "+ score + ", rango asignado -> 2750+");
  //     }
  //     if ((score >= 2900) && (score < 3000)) { 
  //       discordUser.roles.add(role1500);
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role500)
  //       discordUser.roles.remove(role1000)
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role2500)
  //       discordUser.roles.remove(role3000)
  //       message.channel.send( discordUser +" Rango actualizado correctamente. Score actual "+ score + ", rango asignado -> 2900+");
  //     }

  //     if ((score >= 3000) && (score < 3200)) { 
  //       discordUser.roles.add(role2000);
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role500)
  //       discordUser.roles.remove(role1000)
  //       discordUser.roles.remove(role1500)
  //       discordUser.roles.remove(role2500)
  //       discordUser.roles.remove(role3000)

  //       message.channel.send( discordUser +" Rango actualizado correctamente. Score actual "+ score + ", rango asignado -> 3000+");

  //     }
  //     if ((score > 3200) && (score < 3400)) { 
  //       discordUser.roles.add(role2500);
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role500)
  //       discordUser.roles.remove(role1000)
  //       discordUser.roles.remove(role1500)
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role3000)

  //       message.channel.send( discordUser +" Rango actualizado correctamente. Score actual "+ score + ", rango asignado -> 3200+");

  //     }
  //     if (score >= 3400)  { 
  //       discordUser.roles.add(role3000);
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role500)
  //       discordUser.roles.remove(role1000)
  //       discordUser.roles.remove(role1500)
  //       discordUser.roles.remove(role2000)
  //       discordUser.roles.remove(role2500)
  //       message.channel.send( discordUser +" Rango actualizado correctamente. Score actual "+ score + ", rango asignado -> 3400+");

  //     }
  //   })
  //   .catch(error => {
  //     console.log(error);
  //   });

  //   message.delete()
  // }