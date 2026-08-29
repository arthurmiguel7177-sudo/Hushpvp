const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Insira o token do seu bot e o ID do canal de voz aqui
const TOKEN = 'SEU_TOKEN_DO_BOT_AQUI';
const CHANNEL_ID = 'ID_DO_CANAL_DE_VOZ_AQUI';

client.once('ready', async () => {
    console.log(`Bot logado como ${client.user.tag}!`);

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        
        if (!channel || channel.type !== 2) {
            return console.log('Canal de voz não encontrado ou ID inválido!');
        }

        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        console.log(`Conectado com sucesso no canal: ${channel.name}`);
    } catch (error) {
        console.error('Erro ao conectar no canal de voz:', error);
    }
});

client.login(TOKEN);
