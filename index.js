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
    ActivityType,
    SlashCommandBuilder
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');


// ======================================================
// ⚙️ CONFIGURAÇÕES
// ======================================================

const GUILD_ID = '1545935454694670378';


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
// ⚔️ COMANDO /TEAM
// ======================================================

const teamCommand = new SlashCommandBuilder()
    .setName('team')
    .setDescription('Mostra a equipe oficial do HushPvP');


// ======================================================
// 🚀 BOT ONLINE
// ======================================================

client.once('ready', async () => {

    console.log('======================================');
    console.log(`🐺 HushPvP online como ${client.user.tag}`);
    console.log('======================================');


    // ==================================================
    // 🎮 STATUS
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
    // ⚔️ REGISTRAR /TEAM NO SERVIDOR HUSHPVP
    // ==================================================

    try {

        const guild = await client.guilds.fetch(GUILD_ID);

        await guild.commands.set([
            teamCommand.toJSON()
        ]);

        console.log('✅ /team registrado diretamente no HushPvP!');

    } catch (error) {

        console.error(
            '❌ Erro ao registrar /team:',
            error
        );
    }


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
                '⚠️ Algumas mensagens antigas não puderam ser apagadas.'
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
        // 📦 PAINEL DAS REGRAS
        // ==================================================

        const rulesContainer = new ContainerBuilder()

            .setAccentColor(0x009DFF)

            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL(
                                'attachment://regras.png'
                            )
                    )
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# 📜 SERVER RULES

> To maintain a fair, competitive and enjoyable environment, all players must follow the rules below.`
                    )
            )

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


        await rulesChannel.send({
            components: [
                rulesContainer
            ],
            files: [
                banner
            ],
            flags: MessageFlags.IsComponentsV2
        });


        console.log('✅ Painel de regras enviado!');


    } catch (error) {

        console.error(
            '❌ Erro ao enviar regras:',
            error
        );
    }

});


// ======================================================
// ⚔️ SISTEMA DO /TEAM
// ======================================================

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== 'team') return;


    try {

        await interaction.guild.members.fetch();


        // ==================================================
        // 👑 CARGOS
        // ==================================================

        const ownerRole = interaction.guild.roles.cache.find(
            role =>
                role.name.toLowerCase() === 'owner' ||
                role.name.toLowerCase() === 'owners'
        );


        const adminRole = interaction.guild.roles.cache.find(
            role =>
                role.name.toLowerCase() === 'admin' ||
                role.name.toLowerCase() === 'admins' ||
                role.name.toLowerCase() === 'administrator'
        );


        const staffRole = interaction.guild.roles.cache.find(
            role =>
                role.name.toLowerCase() === 'staff' ||
                role.name.toLowerCase() === 'staffs'
        );


        // ==================================================
        // 👑 OWNERS
        // ==================================================

        const owners = ownerRole
            ? ownerRole.members.map(
                member => `• ${member}`
            )
            : [];


        // ==================================================
        // 🛡️ ADMINS
        // ==================================================

        const admins = adminRole
            ? adminRole.members.map(
                member => `• ${member}`
            )
            : [];


        // ==================================================
        // ⚔️ STAFF
        // ==================================================

        const staffs = staffRole
            ? staffRole.members.map(
                member => `• ${member}`
            )
            : [];


        // ==================================================
        // 📦 PAINEL TEAM
        // ==================================================

        const teamContainer = new ContainerBuilder()

            .setAccentColor(0x009DFF)

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# 🐺 HUSHPVP TEAM

> Meet the official team responsible for keeping **HushPvP** organized, fair and competitive.

# 👑 OWNER

${owners.length
    ? owners.join('\n')
    : '• No members'}

# 🛡️ ADMIN

${admins.length
    ? admins.join('\n')
    : '• No members'}

# ⚔️ STAFF

${staffs.length
    ? staffs.join('\n')
    : '• No members'}

> 💙 **HushPvP • Official Staff Team**`
                    )
            );


        await interaction.reply({
            components: [
                teamContainer
            ],
            flags: MessageFlags.IsComponentsV2
        });


    } catch (error) {

        console.error(
            '❌ Erro no /team:',
            error
        );


        if (!interaction.replied) {

            await interaction.reply({
                content:
                    '❌ Ocorreu um erro ao carregar a equipe.',
                ephemeral: true
            });
        }

    }

});


// ======================================================
// ❌ ERROS
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
