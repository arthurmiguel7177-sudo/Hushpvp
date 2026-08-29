require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
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
    console.log(`Bot logado como ${client.user.tag}!`);

    try {
        const voiceChannel = await client.channels.fetch(process.env.CHANNEL_ID);
        if (voiceChannel) {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            console.log(`Conectado no canal de voz: ${voiceChannel.name}`);
        }
    } catch (error) {
        console.error('Erro no canal de voz:', error);
    }

    try {
        const rulesChannel = await client.channels.fetch(process.env.CANAL_REGRAS_ID);
        if (rulesChannel && rulesChannel.isTextBased()) {
            const messages = await rulesChannel.messages.fetch({ limit: 10 });
            if (messages.size > 0) {
                await rulesChannel.bulkDelete(messages).catch(() => {});
            }

            // Prepara o arquivo regras.png para ser enviado direto pelo bot
            const banner = new AttachmentBuilder('./regras.png');

            // Envia a imagem do banner primeiro
            await rulesChannel.send({ files: [banner] });

            // Embed estruturado com categorias, tópicos e linhas
            const embedRegras = new EmbedBuilder()
                .setColor('#00bfff')
                .setTitle('📜 SERVER RULES')
                .setDescription('To maintain a fair, competitive and enjoyable environment, all players must follow the rules below.\n\n' +
                    '────────────────────────────────────────\n\n' +
                    '🔇 **CHAT MUTES**\n' +
                    '• Unauthorized links (except approved creators)\n' +
                    '• Advertising servers, communities or services\n' +
                    '• Selling items outside allowed channels\n' +
                    '• Bypassing chat filters\n' +
                    '• Toxic or disrespectful behavior\n' +
                    '• Mild discrimination\n' +
                    '• Inappropriate content\n' +
                    '• Spam, flooding or repetitive messages\n\n' +
                    '────────────────────────────────────────\n\n' +
                    '⛔ **PERMANENT CHAT MUTES**\n' +
                    '• Harassment, bullying, threats or intimidation\n' +
                    '• Racist, hateful or discriminatory speech\n' +
                    '• Encouraging suicide or self-harm\n' +
                    '• Intentional provocation to create conflicts\n' +
                    '• Sexual, NSFW or 18+ content\n\n' +
                    '────────────────────────────────────────\n\n' +
                    '👢 **KICKS**\n' +
                    '• Interfering with staff or server systems\n' +
                    '• Repeated false reports\n' +
                    '• Intentionally avoiding combat\n' +
                    '• Disruptive gameplay behavior\n' +
                    '• Situations where staff consider a kick necessary\n\n' +
                    '────────────────────────────────────────\n\n' +
                    '🔨 **BANS E PUNIÇÕES GERAIS**\n' +
                    '• Uso de hacks, cheats, autoclicker ou macros\n' +
                    '• Exploração de bugs e falhas do servidor\n' +
                    '• Falsificação de identidade de membros da equipe\n' +
                    '• Golpes, fraudes e tentativas de roubo de contas\n' +
                    '• Tentativa de burlar punições usando contas alternativas'
                )
                .setFooter({ text: 'HushPvP • Jogue limpo. Respeite os outros. Seja competitivo. ⚔️' })
                .setTimestamp();

            await rulesChannel.send({ embeds: [embedRegras] });
            console.log('Painel de regras e imagem enviados com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao enviar as regras:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
