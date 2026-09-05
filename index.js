require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
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
// 🚀 QUANDO O BOT LIGAR
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
        }

        else if (!voiceChannel.isVoiceBased()) {
            console.log('❌ O CHANNEL_ID não é de um canal de voz.');
        }

        else {

            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,

                // Bot fica surdo no canal
                selfDeaf: true,

                // Bot não fica mutado
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
            console.log('❌ O CANAL_REGRAS_ID não é um canal de texto.');
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
                '⚠️ Não foi possível apagar todas as mensagens antigas.'
            );

        }


        // ==================================================
        // 🖼️ BANNER
        // ==================================================

        const banner = new AttachmentBuilder('./regras.png');

        await rulesChannel.send({
            files: [banner]
        });


        // ==================================================
        // 📜 HUSHPVP SERVER RULES
        // ==================================================

        await rulesChannel.send(
`# 📜 HUSHPVP SERVER RULES

> To maintain a fair, competitive and enjoyable environment, all players must follow the rules below.`
        );


        // ==================================================
        // 🔇 CHAT MUTES
        // ==================================================

        await rulesChannel.send(
`# 🔇 CHAT MUTES

• Unauthorized links (except approved creators)
• Advertising servers, communities or services
• Selling items outside allowed channels
• Bypassing chat filters
• Toxic or disrespectful behavior
• Mild discrimination
• Inappropriate content
• Spam, flooding or repetitive messages`
        );


        // ==================================================
        // ⛔ PERMANENT CHAT MUTES
        // ==================================================

        await rulesChannel.send(
`# ⛔ PERMANENT CHAT MUTES

• Harassment, bullying, threats or intimidation
• Racist, hateful or discriminatory speech
• Encouraging suicide or self-harm
• Intentional provocation to create conflicts
• Sexual, NSFW or 18+ content`
        );


        // ==================================================
        // 👢 KICKS
        // ==================================================

        await rulesChannel.send(
`# 👢 KICKS

• Interfering with staff or server systems
• Repeated false reports
• Intentionally avoiding combat
• Disruptive gameplay behavior
• Situations where staff consider a kick necessary`
        );


        // ==================================================
        // 🚫 PERMANENT BANS
        // ==================================================

        await rulesChannel.send(
`# 🚫 PERMANENT BANS

• Cheats, hacks or unfair advantages
• Exploiting bugs or unintended mechanics
• DDoS threats or attacks
• Account sharing to evade punishments
• Ban evasion
• Impersonating staff members
• Actions that seriously damage the community`
        );


        // ==================================================
        // ⏳ TEMPORARY BANS
        // ==================================================

        await rulesChannel.send(
`# ⏳ TEMPORARY BANS

• Repeated combat avoidance
• Match fixing or collusion
• Bug abuse
• Offensive builds
• Unsportsmanlike behavior
• Stat boosting`
        );


        // ==================================================
        // ℹ️ ADDITIONAL INFORMATION
        // ==================================================

        await rulesChannel.send(
`# ℹ️ ADDITIONAL INFORMATION

• Punishments may be increased for repeated offenses
• Staff decisions are final
• Rules may be updated without prior notice

> **HushPvP • Play fair. Respect others. Stay competitive. ⚔️**`
        );


        console.log(
            '✅ Regras do HushPvP enviadas com sucesso!'
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
