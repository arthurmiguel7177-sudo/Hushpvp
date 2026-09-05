require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    AttachmentBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    ActivityType
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');


// ======================================================
// 🌐 SERVIDOR WEB
// ======================================================

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🐺 HushPvP Bot está online!');
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor web rodando na porta ${PORT}`);
});


// ======================================================
// 🤖 CLIENTE DISCORD
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

    console.log('======================================');
    console.log(`🐺 HushPvP online como ${client.user.tag}`);
    console.log('======================================');


    // ==================================================
    // 🎮 STATUS DO BOT
    // ==================================================

    client.user.setPresence({
        activities: [
            {
                name: 'HushPvP ⚔️',
                type: ActivityType.Playing
            }
        ],
        status: 'online'
    });


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
                `🔊 Conectado no canal de voz: ${voiceChannel.name}`
            );
        }

    } catch (error) {

        console.error(
            '❌ Erro ao entrar no canal de voz:',
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

            console.log('❌ Canal de regras inválido.');
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
                '⚠️ Não foi possível apagar algumas mensagens antigas.'
            );
        }


        // ==================================================
        // 🖼️ BANNER
        // ==================================================

        const banner = new AttachmentBuilder(
            './regras.png',
            {
                name: 'regras.png'
            }
        );


        // ==================================================
        // 📦 PAINEL COMPONENTS V2
        // ==================================================

        const container = new ContainerBuilder()

            .setAccentColor(0x009DFF)

            // ==============================================
            // 🖼️ BANNER NO TOPO
            // ==============================================

            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL(
                                'attachment://regras.png'
                            )
                    )
            )


            // ==============================================
            // 📜 SERVER RULES
            // ==============================================

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# 📜 SERVER RULES

> To maintain a fair, competitive and enjoyable environment, all players must follow the rules below.`
                    )
            )


            // ==============================================
            // 🔇 CHAT MUTES
            // ==============================================

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# 🔇 CHAT MUTES

• Unauthorized links (except approved creators)
• Advertising servers, communities or services
• Selling items outside allowed channels
• Bypassing chat filters
• Toxic or disrespectful behavior
• Mild discrimination
• Inappropriate content
• Spam, flooding or repetitive messages`
                    )
            )


            // ==============================================
            // ⛔ PERMANENT CHAT MUTES
            // ==============================================

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# ⛔ PERMANENT CHAT MUTES

• Harassment, bullying, threats or intimidation
• Racist, hateful or discriminatory speech
• Encouraging suicide or self-harm
• Intentional provocation to create conflicts
• Sexual, NSFW or 18+ content`
                    )
            )


            // ==============================================
            // 👢 KICKS
            // ==============================================

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# 👢 KICKS

• Interfering with staff or server systems
• Repeated false reports
• Intentionally avoiding combat
• Disruptive gameplay behavior
• Situations where staff consider a kick necessary`
                    )
            )


            // ==============================================
            // 🚫 PERMANENT BANS
            // ==============================================

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# 🚫 PERMANENT BANS

• Cheats, hacks or unfair advantages
• Exploiting bugs or unintended mechanics
• DDoS threats or attacks
• Account sharing to evade punishments
• Ban evasion
• Impersonating staff members
• Actions that seriously damage the community`
                    )
            )


            // ==============================================
            // ⏳ TEMPORARY BANS
            // ==============================================

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# ⏳ TEMPORARY BANS

• Repeated combat avoidance
• Match fixing or collusion
• Bug abuse
• Offensive builds
• Unsportsmanlike behavior
• Stat boosting`
                    )
            )


            // ==============================================
            // ℹ️ ADDITIONAL INFORMATION
            // ==============================================

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# ℹ️ ADDITIONAL INFORMATION

• Punishments may be increased for repeated offenses
• Staff decisions are final
• Rules may be updated without prior notice

> 🐺 **HushPvP**
> Play fair • Respect others • Stay competitive ⚔️`
                    )
            );


        // ==================================================
        // 📤 ENVIAR PAINEL
        // ==================================================

        await rulesChannel.send({
            components: [container],
            files: [banner],
            flags: MessageFlags.IsComponentsV2
        });


        console.log(
            '✅ Painel de regras HushPvP enviado com sucesso!'
        );


    } catch (error) {

        console.error(
            '❌ Erro ao enviar painel de regras:',
            error
        );
    }

});


// ======================================================
// ❌ ERROS DO CLIENTE
// ======================================================

client.on('error', error => {

    console.error(
        '❌ Erro do Discord:',
        error
    );

});


// ======================================================
// 🔐 LOGIN
// ======================================================

client.login(process.env.DISCORD_TOKEN);
