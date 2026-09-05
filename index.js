require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    AttachmentBuilder
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');


// ======================================================
// 🌐 SERVIDOR WEB
// ======================================================

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('HushPvP Bot está online! ✅');
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor web do HushPvP rodando na porta ${PORT}`);
});


// ======================================================
// 🤖 BOT HUSHPVP
// ======================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


// ======================================================
// 🚀 QUANDO O BOT FICAR ONLINE
// ======================================================

client.once('ready', async () => {

    console.log(`✅ HushPvP conectado como ${client.user.tag}!`);


    // ==================================================
    // 🔊 ENTRAR NO CANAL DE VOZ
    // ==================================================

    try {

        const voiceChannel = await client.channels.fetch(
            process.env.CHANNEL_ID
        );

        if (!voiceChannel) {

            console.log('❌ Canal de voz não encontrado.');

        } else if (!voiceChannel.isVoiceBased()) {

            console.log('❌ CHANNEL_ID não é um canal de voz.');

        } else {

            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            console.log(
                `🔊 HushPvP conectado no canal de voz: ${voiceChannel.name}`
            );

        }

    } catch (error) {

        console.error(
            '❌ Erro ao conectar no canal de voz:',
            error
        );

    }


    // ==================================================
    // 📜 CANAL DE REGRAS
    // ==================================================

    try {

        const rulesChannel = await client.channels.fetch(
            process.env.CANAL_REGRAS_ID
        );

        if (!rulesChannel) {

            console.log('❌ Canal de regras não encontrado.');
            return;

        }

        if (!rulesChannel.isTextBased()) {

            console.log('❌ CANAL_REGRAS_ID não é um canal de texto.');
            return;

        }


        // ==================================================
        // 🧹 APAGAR MENSAGENS ANTIGAS
        // ==================================================

        try {

            const messages = await rulesChannel.messages.fetch({
                limit: 100
            });

            if (messages.size > 0) {

                await rulesChannel.bulkDelete(
                    messages,
                    true
                );

                console.log('🧹 Mensagens antigas apagadas.');

            }

        } catch (error) {

            console.log(
                '⚠️ Algumas mensagens antigas não puderam ser apagadas.'
            );

        }


        // ==================================================
        // 🖼️ BANNER
        // ==================================================

        const banner = new AttachmentBuilder(
            './regras.png'
        );


        // ==================================================
        // 📦 EMBED / CAIXA DE REGRAS
        // ==================================================

        const rulesEmbed = new EmbedBuilder()

            // cor da lateral da caixa
            .setColor('#2B2D31')

            // imagem dentro da caixa
            .setImage('attachment://regras.png')

            // regras
            .setDescription(
`# 📜 SERVER RULES

> To maintain a fair, competitive and enjoyable environment, all players must follow the rules below.

# 🔇 CHAT MUTES

• Unauthorized links (except approved creators)
• Advertising servers, communities or services
• Selling items outside allowed channels
• Bypassing chat filters
• Toxic or disrespectful behavior
• Mild discrimination
• Inappropriate content
• Spam, flooding or repetitive messages


# ⛔ PERMANENT CHAT MUTES

• Harassment, bullying, threats or intimidation
• Racist, hateful or discriminatory speech
• Encouraging suicide or self-harm
• Intentional provocation to create conflicts
• Sexual, NSFW or 18+ content


# 👢 KICKS

• Interfering with staff or server systems
• Repeated false reports
• Intentionally avoiding combat
• Disruptive gameplay behavior
• Situations where staff consider a kick necessary


# 🚫 PERMANENT BANS

• Cheats, hacks or unfair advantages
• Exploiting bugs or unintended mechanics
• DDoS threats or attacks
• Account sharing to evade punishments
• Ban evasion
• Impersonating staff members
• Actions that seriously damage the community


# ⏳ TEMPORARY BANS

• Repeated combat avoidance
• Match fixing or collusion
• Bug abuse
• Offensive builds
• Unsportsmanlike behavior
• Stat boosting


# ℹ️ ADDITIONAL INFORMATION

• Punishments may be increased for repeated offenses
• Staff decisions are final
• Rules may be updated without prior notice`
            )

            .setFooter({
                text: 'HushPvP • Play fair. Respect others. Stay competitive. ⚔️'
            });


        // ==================================================
        // 📤 ENVIAR PAINEL
        // ==================================================

        await rulesChannel.send({
            embeds: [rulesEmbed],
            files: [banner]
        });


        console.log(
            '✅ Painel de regras do HushPvP enviado com sucesso!'
        );


    } catch (error) {

        console.error(
            '❌ Erro ao enviar as regras:',
            error
        );

    }

});


// ======================================================
// 🔐 LOGIN
// ======================================================

client.login(process.env.DISCORD_TOKEN);
