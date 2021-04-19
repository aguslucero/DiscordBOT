import { Client, Message, TextChannel, MessageEmbed, EmbedField } from "discord.js";
const Discord = require('discord.js');



export const gr = new Discord.MessageEmbed()
	.setColor('#0x0099ff')
	.setTitle('Group roll')
	.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
	.setDescription('el roll comenzara en 20sg')
	.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
	.addFields(
		{
			name: 'el roll mas bajo pagara la diferencia al roll mas alto:',
			value: '-------------------------------------------------------------',
			inline: false
		},
	)
	.setTimestamp()
	.setFooter('reacciona para entrar o salir del group roll');


export const seleccionrole = new Discord.MessageEmbed()
	.setColor('#0x0099ff')
	.setTitle('Seleccion de rol')
	.setAuthor('ThrydiaBot', 'https://i.imgur.com/f2u7bLn.png', 'https://discord.js.org')
	.setDescription('Selecciona el rol de tu personaje principal')
	.setThumbnail('https://thumbs.gfycat.com/LimitedPoliticalHairstreakbutterfly-max-14mb.gif')
	.addFields(
		{
			name: 'Solo podras seleccionar un rol',
			value: '-------------------------------------------------------------',
			inline: false
		},
	)
	.setTimestamp()
	.setFooter('Seleccion de clase');

export const roll = new Discord.MessageEmbed()
	.setColor('#0x0099ff')
	.setTitle('1vs1 roll')
	.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
	.setDescription('tiene 20 sg para aceptar el reto')
	.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
	.setTimestamp()
	.setFooter('reacciona para aceptar el reto!');


export const fieldTitle: EmbedField = {
	name: 'el roll mas bajo pagara la diferencia al roll mas alto:',
	value: '-------------------------------------------------------------',
	inline: false

}

export const balaceCheck = new Discord.MessageEmbed()
	.setColor('#0x0099ff')


export const dr = new Discord.MessageEmbed()
	.setColor('#0x0099ff')
	.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
	.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
	.setTimestamp()
	.setFooter('reacciona para aceptar el reto!');

export const lottery = new Discord.MessageEmbed()
	.setColor('#0x0099ff')
	.setTitle('Loteria')
	.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
	.setDescription('Reacciona para comprar un ticket')
	.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
	.setTimestamp()
	.addFields(
		{
			name: '✅ Estado: Abierta',
			value: '-------------------',
			inline: false
		},
		{
			name: '🎟️ Entradas: 0',
			value: '-------------------',
			inline: false
		},
		{
			name: '💰 Costo del ticket: 15000 ',
			value: '-------------------',
			inline: false
		},
		{
			name: '⏲️ Cierre:',
			value: '-------------------',
			inline: false
		},
		{
			name: '___________________',
			value: '___________________',
			inline: false
		},
		{
			name: 'Primer premio: <:gold:827663569565908993> 0',
			value: '-------------------',
			inline: false
		},
		{
			name: 'Segundo premio: <:gold:827663569565908993> 0',
			value: '-------------------',
			inline: false
		},
		{
			name: 'Tercer premio: <:gold:827663569565908993>  0',
			value: '-------------------',
			inline: false
		},
	)
	.setFooter('reacciona para aceptar el reto!');



export const nari = new MessageEmbed()
	.setColor('#0x0099ff')
	.setAuthor('ThrydiaBot', 'https://4.bp.blogspot.com/-VcJ24XFJwcs/UKRCdrgXB1I/AAAAAAAAAl0/KuAsd-aY8vc/s320/Foto%2B1.jpg', 'https://discord.js.org')
	.setThumbnail('https://media.tenor.com/images/6b5c1dd76c2a7ac8cad04ac4e10353b3/tenor.gif')
	.setTimestamp()
	.setFooter('reacciona tu eleccion!');
