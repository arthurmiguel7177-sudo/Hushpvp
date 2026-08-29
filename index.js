require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot do HushPvP está online!');
});

app.listen(PORT, () => {
    console.log(`Servidor web rodando na porta ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`Bot logado como ${client.user.tag}! Pronto para gerenciar a staff e o canal de voz.`);

    try {
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        
        if (!channel || channel.type !== 2) {
            return console.log('Canal de voz não encontrado ou ID inválido!');
        }

        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        console.log(`Conectado com sucesso no canal de voz: ${channel.name}`);
    } catch (error) {
        console.error('Erro ao conectar no canal de voz:', error);
    }
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('Pong! O bot está online e operando.');
    }
});

client.login(process.env.DISCORD_TOKEN);
