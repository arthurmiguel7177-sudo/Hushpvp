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
    console.log(`🌐 HushPvP rodando na porta ${PORT}`);
});


// ======================================================
// 🤖 BOT
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
// 🚀 BOT ONLINE
// ======================================================

client.once('ready', async () => {

    console.log(`✅ Bot conectado como ${client.user.tag}`);


    // ==================================================
    // 🔊 CANAL DE VOZ
    // ==================================================

    try {

        const voiceChannel = await client.channels.fetch(
            process.env.CHANNEL_ID
        );

        if (voiceChannel && voiceChannel.isVoiceBased()) {

            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            console.log(
                `🔊 Conectado no canal: ${voiceChannel.name}`
            );

        } else {

            console.log('❌ Canal de voz não encontrado.');

        }

    } catch (error) {

        console.error(
            '❌ Erro no canal de voz:',
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

        if (!rulesChannel || !rulesChannel.isTextBased()) {

            console.log('❌ Canal de regras não encontrado.');
            return;

        }


        // ==================================================
        // 🧹 APAGAR PAINEL ANTIGO
        // ==================================================

        try {

            const messages = await rulesChannel.messages.fetch({
                limit: 100
            });

            await rulesChannel.bulkDelete(
                messages,
                true
            );

        } catch (error) {

            console.log(
                '⚠️ Não consegui apagar algumas mensagens antigas.'
            );

        }


        // ==================================================
        // 🖼️ CARREGAR BANNER
        // ==================================================

        const banner = new AttachmentBuilder(
            './regras.png'
        );


        // ==================================================
        // 🖼️ PRIMEIRO EMBED = BANNER NO TOPO
        // ==================================================

        const bannerEmbed = new EmbedBuilder()

            .setColor('#00A8FF')

            .setImage(
                'attachment://regras.png'
            );


        // ==================================================
        // 📜 SEGUNDO EMBED = REGRAS
        // ==================================================

        const rulesEmbed = new EmbedBuilder()

            .setColor('#00A8FF')

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
        // 📤 ENVIAR TUDO JUNTO
        // ==================================================

        await rulesChannel.send({

            embeds: [
                bannerEmbed,
                rulesEmbed
            ],

            files: [
                banner
            ]

        });


        console.log(
            '✅ Painel de regras enviado!'
        );


    } catch (error) {

        console.error(
            '❌ Erro ao enviar regras:',
            error
        );

    }

});


// ======================================================
// 🔐 LOGIN
// ======================================================

client.login(process.env.DISCORD_TOKEN);
