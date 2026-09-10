require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    ActivityType,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    AttachmentBuilder,
    MessageFlags,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');


// ======================================================
// ⭐ ASTER — CONFIGURAÇÕES
// ======================================================

const SERVER_NAME = 'Aster';

const GUILD_ID = '1545935454694670378';

// 📝 RECRUTAMENTO
const RECRUITMENT_CHANNEL_ID = '1545962982385647687';
const APPLICATION_REVIEW_CHANNEL_ID = '1545963991736524840';
const REVIEW_LOG_CHANNEL_ID = '1545956902826151956';

// 🎫 TICKET
const TICKET_PANEL_CHANNEL_ID = '1545956394342289478';

// PRECISA SER UMA CATEGORIA
const TICKET_CATEGORY_ID = '1546151207217668166';

// 📥 DOWNLOAD DO ASTER CLIENT
const DOWNLOAD_CHANNEL_ID = '1546641835773132922';
const DOWNLOAD_URL = 'https://www.mediafire.com/file/9ex3ssu2qykmvur/AsterClient-Instalador-Oficial.zip/file';


// ======================================================
// 💾 MEMÓRIA TEMPORÁRIA
// ======================================================

const applicationsInProgress = new Set();
const applications = new Map();
const ticketSelections = new Map();


// ======================================================
// 🌐 EXPRESS
// ======================================================

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('⭐ Aster Bot Online!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web online na porta ${PORT}`);
});


// ======================================================
// 🤖 CLIENT
// ======================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
    ],

    partials: [
        Partials.Channel
    ]
});


// ======================================================
// 🛡️ CARGOS STAFF
// ======================================================

const STAFF_ROLE_NAMES = [
    'owner',
    'owners',
    'admin',
    'admins',
    'administrator',
    'staff',
    'staffs',
    'moderador',
    'moderadores',
    'moderator',
    'moderators'
];


// ======================================================
// 🛡️ VERIFICAR STAFF
// ======================================================

function isStaff(member) {

    if (!member) return false;

    if (
        member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    ) {
        return true;
    }

    return member.roles.cache.some(role =>
        STAFF_ROLE_NAMES.includes(
            role.name.toLowerCase()
        )
    );
}


// ======================================================
// 👑 VERIFICAR ADMIN
// ======================================================

function isAdmin(member) {

    if (!member) return false;

    if (
        member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    ) {
        return true;
    }

    const adminRoles = [
        'owner',
        'owners',
        'admin',
        'admins',
        'administrator'
    ];

    return member.roles.cache.some(role =>
        adminRoles.includes(
            role.name.toLowerCase()
        )
    );
}


// ======================================================
// ⏰ CONVERTER TEMPO
// ======================================================

function parseDuration(input) {

    if (!input) return null;

    const match = input
        .toLowerCase()
        .match(/^(\d+)(s|m|h|d)$/);

    if (!match) return null;

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return value * multipliers[unit];
}


// ======================================================
// ⚔️ COMANDOS
// ======================================================

// /team

const teamCommand = new SlashCommandBuilder()
    .setName('team')
    .setDescription('Mostra a equipe oficial do Aster');


// /statuson

const statusOnCommand = new SlashCommandBuilder()
    .setName('statuson')
    .setDescription('Mostra que o servidor Aster está ONLINE');


// /statusoff

const statusOffCommand = new SlashCommandBuilder()
    .setName('statusoff')
    .setDescription('Mostra que o servidor Aster está OFFLINE');


// ======================================================
// 🔨 /BAN
// ======================================================

const banCommand = new SlashCommandBuilder()

    .setName('ban')
    .setDescription('Bane um membro do Aster')

    .addUserOption(option =>
        option
            .setName('usuario')
            .setDescription('Usuário que será banido')
            .setRequired(true)
    )

    .addStringOption(option =>
        option
            .setName('motivo')
            .setDescription('Motivo do banimento')
            .setRequired(true)
    )

    .setDefaultMemberPermissions(
        PermissionFlagsBits.BanMembers
    );


// ======================================================
// 👢 /KICK
// ======================================================

const kickCommand = new SlashCommandBuilder()

    .setName('kick')
    .setDescription('Expulsa um membro do Aster')

    .addUserOption(option =>
        option
            .setName('usuario')
            .setDescription('Usuário que será expulso')
            .setRequired(true)
    )

    .addStringOption(option =>
        option
            .setName('motivo')
            .setDescription('Motivo da expulsão')
            .setRequired(true)
    )

    .setDefaultMemberPermissions(
        PermissionFlagsBits.KickMembers
    );


// ======================================================
// 🔇 /MUTE
// ======================================================

const muteCommand = new SlashCommandBuilder()

    .setName('mute')
    .setDescription('Muta um membro do Aster')

    .addUserOption(option =>
        option
            .setName('usuario')
            .setDescription('Usuário que será mutado')
            .setRequired(true)
    )

    .addStringOption(option =>
        option
            .setName('tempo')
            .setDescription('Exemplo: 10m, 1h, 1d')
            .setRequired(true)
    )

    .addStringOption(option =>
        option
            .setName('motivo')
            .setDescription('Motivo do mute')
            .setRequired(true)
    )

    .setDefaultMemberPermissions(
        PermissionFlagsBits.ModerateMembers
    );


// ======================================================
// 🔊 /UNMUTE
// ======================================================

const unmuteCommand = new SlashCommandBuilder()

    .setName('unmute')
    .setDescription('Remove o mute de um membro')

    .addUserOption(option =>
        option
            .setName('usuario')
            .setDescription('Usuário')
            .setRequired(true)
    )

    .setDefaultMemberPermissions(
        PermissionFlagsBits.ModerateMembers
    );


// ======================================================
// 🎫 PAINEL DE TICKET
// ======================================================

async function sendTicketPanel() {

    try {

        const channel = await client.channels.fetch(
            TICKET_PANEL_CHANNEL_ID
        );

        if (!channel || !channel.isTextBased()) {
            console.log('❌ Canal do painel de ticket inválido.');
            return;
        }


        // APAGA SOMENTE MENSAGENS ANTIGAS DO BOT
        try {

            const messages = await channel.messages.fetch({
                limit: 30
            });

            const botMessages = messages.filter(
                message =>
                    message.author.id === client.user.id
            );

            for (const message of botMessages.values()) {
                await message.delete().catch(() => {});
            }

        } catch {}


        const startButton = new ButtonBuilder()
            .setCustomId('ticket_start')
            .setLabel('Iniciar Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary);


        const row = new ActionRowBuilder()
            .addComponents(startButton);


        const container = new ContainerBuilder()

            .setAccentColor(0x7B2EFF)

            .addTextDisplayComponents(

                new TextDisplayBuilder().setContent(
`# ⭐ ASTER • CENTRAL DE SUPORTE

## 🎫 PRECISA DE ATENDIMENTO?

Bem-vindo à Central de Suporte do **Aster**.

Nossa equipe está disponível para ajudar você com problemas, dúvidas ou outras situações relacionadas ao servidor.

## 📂 TIPOS DE ATENDIMENTO

🎫 **Support**
Problemas gerais relacionados ao servidor.

🆘 **Ajuda**
Precisa da ajuda de um membro da equipe.

❓ **Dúvida**
Possui alguma dúvida sobre o Aster.

## ⚠️ ANTES DE ABRIR UM TICKET

• Não abra tickets sem necessidade
• Explique corretamente o seu problema
• Respeite os membros da equipe
• Não fique marcando Staff
• Aguarde seu atendimento
• Não abra vários tickets ao mesmo tempo

📩 **Clique no botão abaixo para iniciar seu atendimento.**

> ⭐ Aster • Support System`
                )

            )

            .addActionRowComponents(row);


        await channel.send({

            components: [container],

            flags:
                MessageFlags.IsComponentsV2

        });


        console.log(
            '🎫 Painel de suporte Aster enviado!'
        );

    } catch (error) {

        console.error(
            '❌ Erro no painel de ticket:',
            error
        );

    }
}


// ======================================================
// 📝 PAINEL DE RECRUTAMENTO
// ======================================================

async function sendRecruitmentPanel() {

    try {

        const channel = await client.channels.fetch(
            RECRUITMENT_CHANNEL_ID
        );

        if (!channel || !channel.isTextBased()) {
            return;
        }


        // APAGA SOMENTE PAINÉIS ANTIGOS DO BOT
        try {

            const messages = await channel.messages.fetch({
                limit: 20
            });

            const botMessages = messages.filter(
                message =>
                    message.author.id === client.user.id
            );

            for (const message of botMessages.values()) {
                await message.delete().catch(() => {});
            }

        } catch {}


        const applyButton = new ButtonBuilder()
            .setCustomId('aster_apply')
            .setLabel('Enviar candidatura')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary);


        const row = new ActionRowBuilder()
            .addComponents(applyButton);


        const container = new ContainerBuilder()

            .setAccentColor(0x7B2EFF)

            .addTextDisplayComponents(

                new TextDisplayBuilder().setContent(
`# ⭐ RECRUTAMENTO ASTER

## 📝 FAÇA PARTE DA NOSSA EQUIPE

Quer fazer parte da Staff do **Aster**?

Clique no botão abaixo e responda nossa candidatura pela sua DM.

## ✅ REQUISITOS

• Boa comunicação
• Respeito com jogadores e Staff
• Maturidade
• Ser ativo no servidor
• Saber trabalhar em equipe
• Compromisso com o Aster

## 📌 IMPORTANTE

• Responda com sinceridade
• Não envie várias candidaturas
• Mantenha sua DM ativada
• Não envie informações pessoais sensíveis
• Aguarde a análise da administração

📩 **Clique abaixo para iniciar sua candidatura.**

> ⭐ Aster • Recrutamento Oficial`
                )

            )

            .addActionRowComponents(row);


        await channel.send({

            components: [container],

            flags:
                MessageFlags.IsComponentsV2

        });


        console.log(
            '📝 Painel de recrutamento Aster enviado!'
        );

    } catch (error) {

        console.error(
            '❌ Erro no recrutamento:',
            error
        );

    }
}


// ======================================================
// 📜 PAINEL DE REGRAS
// ======================================================

async function sendRulesPanel() {

    if (!process.env.CANAL_REGRAS_ID) {

        console.log(
            '⚠️ CANAL_REGRAS_ID não configurado.'
        );

        return;
    }


    try {

        const channel = await client.channels.fetch(
            process.env.CANAL_REGRAS_ID
        );


        if (!channel || !channel.isTextBased()) {

            console.log(
                '❌ Canal de regras inválido.'
            );

            return;
        }


        // APAGA SOMENTE PAINÉIS ANTIGOS DO PRÓPRIO BOT
        try {

            const messages = await channel.messages.fetch({
                limit: 30
            });

            const botMessages = messages.filter(
                message =>
                    message.author.id === client.user.id
            );

            for (const message of botMessages.values()) {
                await message.delete().catch(() => {});
            }

        } catch {}


        const banner = new AttachmentBuilder(
            './regras.png',
            {
                name: 'regras.png'
            }
        );


        const container = new ContainerBuilder()

            .setAccentColor(0x7B2EFF)

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

                new TextDisplayBuilder().setContent(
`# 📜 ASTER • SERVER RULES

> To maintain a fair, competitive and enjoyable environment, all players must follow the rules below.

# 🔇 CHAT MUTES

• Unauthorized links
• Advertising servers or services
• Selling outside allowed channels
• Bypassing chat filters
• Toxic or disrespectful behavior
• Mild discrimination
• Inappropriate content
• Spam or flooding

# ⛔ PERMANENT CHAT MUTES

• Harassment
• Bullying
• Threats
• Racist or hateful speech
• Encouraging self-harm
• Sexual or NSFW content

# 👢 KICKS

• Interfering with Staff
• Repeated false reports
• Intentionally avoiding combat
• Disruptive gameplay behavior

# 🚫 PERMANENT BANS

• Cheats or hacks
• Exploiting bugs
• DDoS threats or attacks
• Ban evasion
• Impersonating Staff
• Serious damage to the community

# ⏳ TEMPORARY BANS

• Repeated combat avoidance
• Match fixing
• Bug abuse
• Offensive builds
• Unsportsmanlike behavior
• Stat boosting

# ℹ️ ADDITIONAL INFORMATION

• Punishments may increase for repeated offenses
• Staff decisions are final
• Rules may change without prior notice

> ⭐ **ASTER**
> Play fair • Respect others • Stay competitive ⚔️`
                )

            );


        await channel.send({

            components: [container],

            files: [banner],

            flags:
                MessageFlags.IsComponentsV2

        });


        console.log(
            '📜 Regras Aster enviadas!'
        );

    } catch (error) {

        console.error(
            '❌ Erro nas regras:',
            error
        );

    }
}



// ======================================================
// 📥 PAINEL DE DOWNLOAD
// ======================================================

async function sendDownloadPanel() {

    try {

        const channel = await client.channels.fetch(
            DOWNLOAD_CHANNEL_ID
        );

        if (!channel || !channel.isTextBased()) {
            console.log('❌ Canal de download inválido.');
            return;
        }


        // APAGA SOMENTE PAINÉIS ANTIGOS DO PRÓPRIO BOT
        try {

            const messages = await channel.messages.fetch({
                limit: 30
            });

            const botMessages = messages.filter(
                message =>
                    message.author.id === client.user.id
            );

            for (const message of botMessages.values()) {
                await message.delete().catch(() => {});
            }

        } catch {}


        const downloadButton = new ButtonBuilder()
            .setLabel('Baixar Aster Client')
            .setEmoji('📥')
            .setStyle(ButtonStyle.Link)
            .setURL(DOWNLOAD_URL);


        const row = new ActionRowBuilder()
            .addComponents(downloadButton);


        const container = new ContainerBuilder()

            .setAccentColor(0x7B2EFF)

            .addTextDisplayComponents(

                new TextDisplayBuilder().setContent(
`# 📥 ASTER CLIENT • DOWNLOAD

## ⭐ BAIXE O CLIENT OFICIAL

Faça o download do **Aster Client** pelo botão abaixo.

💻 **Plataforma:** Windows
📦 **Arquivo:** AsterClient-Instalador-Oficial.zip

⚠️ Utilize sempre o link oficial disponibilizado pelo Aster.

> ⭐ Aster • Download Oficial`
                )

            )

            .addActionRowComponents(row);


        await channel.send({

            components: [container],

            flags:
                MessageFlags.IsComponentsV2

        });


        console.log(
            '📥 Painel de download Aster enviado!'
        );

    } catch (error) {

        console.error(
            '❌ Erro no painel de download:',
            error
        );

    }
}


// ======================================================
// 🚀 BOT ONLINE
// ======================================================

client.once('ready', async () => {

    console.log('');
    console.log('==========================================');
    console.log(`⭐ ASTER BOT ONLINE — ${client.user.tag}`);
    console.log('👑 xrayvenz');
    console.log('==========================================');
    console.log('');


    // ==================================================
    // 🎮 PRESENÇA
    // ==================================================

    client.user.setPresence({

        activities: [
            {
                name: 'Aster ⚔️',
                type: ActivityType.Playing
            }
        ],

        status: 'online'

    });


    // ==================================================
    // ⚔️ REGISTRAR COMANDOS
    // ==================================================

    try {

        const guild = await client.guilds.fetch(
            GUILD_ID
        );


        await guild.commands.set([

            teamCommand.toJSON(),

            statusOnCommand.toJSON(),

            statusOffCommand.toJSON(),

            banCommand.toJSON(),

            kickCommand.toJSON(),

            muteCommand.toJSON(),

            unmuteCommand.toJSON()

        ]);


        console.log(
            '✅ Comandos registrados!'
        );

    } catch (error) {

        console.error(
            '❌ Erro ao registrar comandos:',
            error
        );

    }


    // ==================================================
    // 🔊 ENTRAR NO VOICE
    // ==================================================

    if (process.env.CHANNEL_ID) {

        try {

            const voiceChannel =
                await client.channels.fetch(
                    process.env.CHANNEL_ID
                );


            if (
                voiceChannel &&
                voiceChannel.isVoiceBased()
            ) {

                joinVoiceChannel({

                    channelId:
                        voiceChannel.id,

                    guildId:
                        voiceChannel.guild.id,

                    adapterCreator:
                        voiceChannel.guild
                            .voiceAdapterCreator,

                    selfDeaf: true,

                    selfMute: false

                });


                console.log(
                    '🔊 Bot conectado ao canal de voz!'
                );

            }

        } catch (error) {

            console.error(
                '❌ Erro no canal de voz:',
                error
            );

        }
    }


    // ==================================================
    // 📜 PAINÉIS
    // ==================================================

    await sendRulesPanel();

    await sendTicketPanel();

    await sendRecruitmentPanel();

    await sendDownloadPanel();

});


// ======================================================
// 🧠 TODAS AS INTERAÇÕES
// ======================================================

client.on('interactionCreate', async interaction => {

    try {


// ======================================================
// ⚔️ SLASH COMMANDS
// ======================================================

        if (interaction.isChatInputCommand()) {


// ======================================================
// 👥 /TEAM
// ======================================================

            if (interaction.commandName === 'team') {

                await interaction.guild.members.fetch();


                const getMembers = names => {

                    const members = new Map();


                    interaction.guild.roles.cache

                        .filter(role =>
                            names.includes(
                                role.name.toLowerCase()
                            )
                        )

                        .forEach(role => {

                            role.members.forEach(member => {

                                members.set(
                                    member.id,
                                    member
                                );

                            });

                        });


                    return [
                        ...members.values()
                    ];
                };


                const owners = getMembers([
                    'owner',
                    'owners'
                ]);


                const admins = getMembers([
                    'admin',
                    'admins',
                    'administrator'
                ]);


                const staffs = getMembers([
                    'staff',
                    'staffs',
                    'moderador',
                    'moderadores',
                    'moderator',
                    'moderators'
                ]);


                const formatMembers = members => {

                    if (!members.length) {
                        return '• Nenhum membro';
                    }

                    return members
                        .map(member =>
                            `• ${member}`
                        )
                        .join('\n');

                };


                const container = new ContainerBuilder()

                    .setAccentColor(0x7B2EFF)

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# ⭐ ASTER TEAM

# 👑 OWNER

${formatMembers(owners)}

# 🛡️ ADMIN

${formatMembers(admins)}

# ⚔️ STAFF

${formatMembers(staffs)}

> ⭐ Aster • Equipe Oficial`
                        )

                    );


                return interaction.reply({

                    components: [container],

                    flags:
                        MessageFlags.IsComponentsV2

                });
            }


// ======================================================
// 🟢 /STATUSON
// ======================================================

            if (
                interaction.commandName ===
                'statuson'
            ) {

                if (!isAdmin(interaction.member)) {

                    return interaction.reply({

                        content:
                            '❌ Apenas Owner/Admin pode usar este comando.',

                        ephemeral: true

                    });
                }


                const container = new ContainerBuilder()

                    .setAccentColor(0x00FF7F)

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# 🟢 ASTER STATUS

## ✅ SERVIDOR ONLINE

O servidor Minecraft do **Aster** está ligado e disponível!

🎮 **Status:** \`ONLINE\`

⚡ O servidor está pronto para receber jogadores.

> ⭐ Aster • Server Status`
                        )

                    );


                return interaction.reply({

                    components: [container],

                    flags:
                        MessageFlags.IsComponentsV2

                });
            }


// ======================================================
// 🔴 /STATUSOFF
// ======================================================

            if (
                interaction.commandName ===
                'statusoff'
            ) {

                if (!isAdmin(interaction.member)) {

                    return interaction.reply({

                        content:
                            '❌ Apenas Owner/Admin pode usar este comando.',

                        ephemeral: true

                    });
                }


                const container = new ContainerBuilder()

                    .setAccentColor(0xFF0000)

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# 🔴 ASTER STATUS

## ❌ SERVIDOR OFFLINE

O servidor Minecraft do **Aster** está desligado ou indisponível no momento.

🎮 **Status:** \`OFFLINE\`

🔧 Aguarde até o servidor retornar.

> ⭐ Aster • Server Status`
                        )

                    );


                return interaction.reply({

                    components: [container],

                    flags:
                        MessageFlags.IsComponentsV2

                });
            }


// ======================================================
// 🔨 /BAN
// ======================================================

            if (interaction.commandName === 'ban') {

                if (
                    !interaction.member.permissions.has(
                        PermissionFlagsBits.BanMembers
                    )
                ) {

                    return interaction.reply({

                        content:
                            '❌ Você não possui permissão para banir membros.',

                        ephemeral: true

                    });
                }


                const user =
                    interaction.options.getUser(
                        'usuario'
                    );


                const reason =
                    interaction.options.getString(
                        'motivo'
                    );


                if (
                    user.id ===
                    interaction.user.id
                ) {

                    return interaction.reply({

                        content:
                            '❌ Você não pode banir você mesmo.',

                        ephemeral: true

                    });
                }


                const targetMember =
                    await interaction.guild.members
                        .fetch(user.id)
                        .catch(() => null);


                if (
                    targetMember &&
                    !targetMember.bannable
                ) {

                    return interaction.reply({

                        content:
                            '❌ Não consigo banir esse membro. Verifique a posição dos cargos do bot.',

                        ephemeral: true

                    });
                }


                // DM ANTES DO BAN
                try {

                    await user.send(
`# 🔨 VOCÊ FOI BANIDO

Você foi banido do servidor **Aster**.

👮 **Staff responsável:** ${interaction.user}

📋 **Motivo:** ${reason}

🔴 **Punição:** BAN

> ⭐ Aster • Moderation`
                    );

                } catch {}


                await interaction.guild.members.ban(
                    user.id,
                    {
                        reason:
                            `${reason} | Staff: ${interaction.user.tag}`
                    }
                );


                const container = new ContainerBuilder()

                    .setAccentColor(0xFF0000)

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# 🔨 USUÁRIO BANIDO

👤 **Usuário:** ${user}

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

🔴 **Punição:** BAN

> ⭐ Aster • Moderation`
                        )

                    );


                return interaction.reply({

                    components: [container],

                    flags:
                        MessageFlags.IsComponentsV2

                });
            }


// ======================================================
// 👢 /KICK
// ======================================================

            if (
                interaction.commandName ===
                'kick'
            ) {

                if (
                    !interaction.member.permissions.has(
                        PermissionFlagsBits.KickMembers
                    )
                ) {

                    return interaction.reply({

                        content:
                            '❌ Você não possui permissão para expulsar membros.',

                        ephemeral: true

                    });
                }


                const member =
                    interaction.options.getMember(
                        'usuario'
                    );


                const reason =
                    interaction.options.getString(
                        'motivo'
                    );


                if (!member) {

                    return interaction.reply({

                        content:
                            '❌ Usuário não encontrado no servidor.',

                        ephemeral: true

                    });
                }


                if (
                    member.id ===
                    interaction.user.id
                ) {

                    return interaction.reply({

                        content:
                            '❌ Você não pode expulsar você mesmo.',

                        ephemeral: true

                    });
                }


                if (!member.kickable) {

                    return interaction.reply({

                        content:
                            '❌ Não consigo expulsar esse membro. Verifique os cargos.',

                        ephemeral: true

                    });
                }


                try {

                    await member.send(
`# 👢 VOCÊ FOI EXPULSO

Você foi expulso do servidor **Aster**.

👮 **Staff responsável:** ${interaction.user}

📋 **Motivo:** ${reason}

🟠 **Punição:** KICK

> ⭐ Aster • Moderation`
                    );

                } catch {}


                const memberTag =
                    member.user.tag;


                await member.kick(
                    `${reason} | Staff: ${interaction.user.tag}`
                );


                const container = new ContainerBuilder()

                    .setAccentColor(0xFF8C00)

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# 👢 USUÁRIO EXPULSO

👤 **Usuário:** ${memberTag}

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

🟠 **Punição:** KICK

> ⭐ Aster • Moderation`
                        )

                    );


                return interaction.reply({

                    components: [container],

                    flags:
                        MessageFlags.IsComponentsV2

                });
            }


// ======================================================
// 🔇 /MUTE
// ======================================================

            if (
                interaction.commandName ===
                'mute'
            ) {

                if (
                    !interaction.member.permissions.has(
                        PermissionFlagsBits.ModerateMembers
                    )
                ) {

                    return interaction.reply({

                        content:
                            '❌ Você não possui permissão para mutar membros.',

                        ephemeral: true

                    });
                }


                const member =
                    interaction.options.getMember(
                        'usuario'
                    );


                const time =
                    interaction.options.getString(
                        'tempo'
                    );


                const reason =
                    interaction.options.getString(
                        'motivo'
                    );


                if (!member) {

                    return interaction.reply({

                        content:
                            '❌ Usuário não encontrado.',

                        ephemeral: true

                    });
                }


                if (
                    member.id ===
                    interaction.user.id
                ) {

                    return interaction.reply({

                        content:
                            '❌ Você não pode mutar você mesmo.',

                        ephemeral: true

                    });
                }


                const duration =
                    parseDuration(time);


                if (!duration) {

                    return interaction.reply({

                        content:
                            '❌ Tempo inválido. Exemplos: `10m`, `1h`, `2d`.',

                        ephemeral: true

                    });
                }


                const MAX_TIMEOUT =
                    28 *
                    24 *
                    60 *
                    60 *
                    1000;


                if (
                    duration > MAX_TIMEOUT
                ) {

                    return interaction.reply({

                        content:
                            '❌ O mute máximo permitido pelo Discord é de 28 dias.',

                        ephemeral: true

                    });
                }


                if (!member.moderatable) {

                    return interaction.reply({

                        content:
                            '❌ Não consigo mutar esse membro. Verifique os cargos.',

                        ephemeral: true

                    });
                }


                await member.timeout(
                    duration,
                    `${reason} | Staff: ${interaction.user.tag}`
                );


                try {

                    await member.send(
`# 🔇 VOCÊ FOI MUTADO

Você recebeu um mute no servidor **Aster**.

⏰ **Tempo:** ${time}

👮 **Staff responsável:** ${interaction.user}

📋 **Motivo:** ${reason}

🟡 **Punição:** MUTE

> ⭐ Aster • Moderation`
                    );

                } catch {}


                const container = new ContainerBuilder()

                    .setAccentColor(0xFFD700)

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# 🔇 USUÁRIO MUTADO

👤 **Usuário:** ${member}

⏰ **Tempo:** ${time}

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

🟡 **Punição:** MUTE

> ⭐ Aster • Moderation`
                        )

                    );


                return interaction.reply({

                    components: [container],

                    flags:
                        MessageFlags.IsComponentsV2

                });
            }


// ======================================================
// 🔊 /UNMUTE
// ======================================================

            if (
                interaction.commandName ===
                'unmute'
            ) {

                if (
                    !interaction.member.permissions.has(
                        PermissionFlagsBits.ModerateMembers
                    )
                ) {

                    return interaction.reply({

                        content:
                            '❌ Você não possui permissão para remover mutes.',

                        ephemeral: true

                    });
                }


                const member =
                    interaction.options.getMember(
                        'usuario'
                    );


                if (!member) {

                    return interaction.reply({

                        content:
                            '❌ Usuário não encontrado.',

                        ephemeral: true

                    });
                }


                if (!member.moderatable) {

                    return interaction.reply({

                        content:
                            '❌ Não consigo remover o mute deste membro.',

                        ephemeral: true

                    });
                }


                await member.timeout(
                    null,
                    `Unmute por ${interaction.user.tag}`
                );


                try {

                    await member.send(
`# 🔊 MUTE REMOVIDO

Seu mute no servidor **Aster** foi removido.

👮 **Staff responsável:** ${interaction.user}

🟢 **Status:** LIBERADO

> ⭐ Aster • Moderation`
                    );

                } catch {}


                const container = new ContainerBuilder()

                    .setAccentColor(0x00FF7F)

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# 🔊 MUTE REMOVIDO

👤 **Usuário:** ${member}

👮 **Staff:** ${interaction.user}

🟢 **Status:** LIBERADO

> ⭐ Aster • Moderation`
                        )

                    );


                return interaction.reply({

                    components: [container],

                    flags:
                        MessageFlags.IsComponentsV2

                });
            }

        }


// ======================================================
// 🎫 BOTÃO INICIAR TICKET
// ======================================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'ticket_start'
        ) {

            const existing =
                interaction.guild.channels.cache.find(
                    channel =>

                        channel.type ===
                            ChannelType.GuildText &&

                        channel.topic?.includes(
                            `ticket-owner:${interaction.user.id}`
                        )
                );


            if (existing) {

                return interaction.reply({

                    content:
                        `⚠️ Você já possui um ticket aberto: ${existing}`,

                    ephemeral: true

                });
            }


            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(
                        'ticket_type'
                    )

                    .setPlaceholder(
                        'Escolha o tipo de atendimento'
                    )

                    .addOptions(

                        {
                            label: 'Support',

                            description:
                                'Problemas gerais no servidor',

                            value:
                                'support',

                            emoji: '🎫'
                        },

                        {
                            label: 'Ajuda',

                            description:
                                'Preciso da ajuda da equipe',

                            value:
                                'ajuda',

                            emoji: '🆘'
                        },

                        {
                            label: 'Dúvida',

                            description:
                                'Tenho uma dúvida',

                            value:
                                'duvida',

                            emoji: '❓'
                        }

                    );


            const row =
                new ActionRowBuilder()
                    .addComponents(menu);


            return interaction.reply({

                content:
`⭐ **ASTER SUPPORT**

Selecione abaixo o motivo do seu atendimento:`,

                components: [row],

                ephemeral: true

            });
        }


// ======================================================
// 📂 ESCOLHEU O TIPO
// ======================================================

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId ===
            'ticket_type'
        ) {

            const type =
                interaction.values[0];


            ticketSelections.set(
                interaction.user.id,
                type
            );


            // POP-UP
            const modal =
                new ModalBuilder()

                    .setCustomId(
                        'ticket_modal'
                    )

                    .setTitle(
                        'Aster • Abrir Ticket'
                    );


            const subjectInput =
                new TextInputBuilder()

                    .setCustomId(
                        'ticket_subject'
                    )

                    .setLabel(
                        'Qual é o assunto?'
                    )

                    .setPlaceholder(
                        'Ex: Problema para entrar no servidor'
                    )

                    .setStyle(
                        TextInputStyle.Short
                    )

                    .setRequired(true)

                    .setMaxLength(100);


            const descriptionInput =
                new TextInputBuilder()

                    .setCustomId(
                        'ticket_description'
                    )

                    .setLabel(
                        'Explique o que aconteceu'
                    )

                    .setPlaceholder(
                        'Explique com detalhes para nossa equipe...'
                    )

                    .setStyle(
                        TextInputStyle.Paragraph
                    )

                    .setRequired(true)

                    .setMaxLength(1000);


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        subjectInput
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        descriptionInput
                    )

            );


            return interaction.showModal(
                modal
            );
        }


// ======================================================
// 🪟 ENVIOU O POP-UP — CRIAR TICKET
// ======================================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId ===
            'ticket_modal'
        ) {

            await interaction.deferReply({
                ephemeral: true
            });


            const existing =
                interaction.guild.channels.cache.find(
                    channel =>

                        channel.type ===
                            ChannelType.GuildText &&

                        channel.topic?.includes(
                            `ticket-owner:${interaction.user.id}`
                        )
                );


            if (existing) {

                return interaction.editReply({

                    content:
                        `⚠️ Você já possui um ticket: ${existing}`

                });
            }


            const type =
                ticketSelections.get(
                    interaction.user.id
                ) || 'support';


            const subject =
                interaction.fields
                    .getTextInputValue(
                        'ticket_subject'
                    );


            const description =
                interaction.fields
                    .getTextInputValue(
                        'ticket_description'
                    );


// ======================================================
// 📁 CATEGORIA DO ATENDIMENTO
// ======================================================

            const category =
                await interaction.guild.channels.fetch(
                    TICKET_CATEGORY_ID
                );


            if (
                !category ||
                category.type !==
                    ChannelType.GuildCategory
            ) {

                return interaction.editReply({

                    content:
`❌ Não consegui criar o ticket.

O ID \`${TICKET_CATEGORY_ID}\` precisa ser o ID de uma **categoria** do Discord.`

                });
            }


// ======================================================
// 🛡️ PERMISSÕES DOS CARGOS
// ======================================================

            const staffRoles =
                interaction.guild.roles.cache.filter(
                    role =>
                        STAFF_ROLE_NAMES.includes(
                            role.name.toLowerCase()
                        )
                );


            const permissions = [

                // @everyone NÃO VÊ
                {
                    id:
                        interaction.guild.roles
                            .everyone.id,

                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },


                // DONO DO TICKET
                {
                    id:
                        interaction.user.id,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },


                // BOT
                {
                    id:
                        client.user.id,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                }

            ];


            // STAFF
            staffRoles.forEach(role => {

                permissions.push({

                    id: role.id,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]

                });

            });


            let safeName =
                interaction.user.username
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]/g,
                        ''
                    )
                    .slice(0, 20);


            if (!safeName) {
                safeName =
                    interaction.user.id;
            }


// ======================================================
// 🎫 CRIAR CANAL
// ======================================================

            const ticketChannel =
                await interaction.guild.channels.create({

                    name:
                        `ticket-${safeName}`,

                    type:
                        ChannelType.GuildText,

                    parent:
                        category.id,

                    topic:
                        `ticket-owner:${interaction.user.id}|type:${type}|status:open`,

                    permissionOverwrites:
                        permissions

                });


            ticketSelections.delete(
                interaction.user.id
            );


            const typeNames = {

                support:
                    '🎫 SUPPORT',

                ajuda:
                    '🆘 AJUDA',

                duvida:
                    '❓ DÚVIDA'

            };


            const claimButton =
                new ButtonBuilder()

                    .setCustomId(
                        'ticket_claim'
                    )

                    .setLabel(
                        'Assumir Ticket'
                    )

                    .setEmoji('🛡️')

                    .setStyle(
                        ButtonStyle.Success
                    );


            const closeButton =
                new ButtonBuilder()

                    .setCustomId(
                        'ticket_close'
                    )

                    .setLabel(
                        'Fechar Ticket'
                    )

                    .setEmoji('🔒')

                    .setStyle(
                        ButtonStyle.Danger
                    );


            const buttons =
                new ActionRowBuilder()

                    .addComponents(
                        claimButton,
                        closeButton
                    );


            const container =
                new ContainerBuilder()

                    .setAccentColor(
                        0x7B2EFF
                    )

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# ⭐ ASTER • NOVO TICKET

## ${typeNames[type] || '🎫 SUPPORT'}

👤 **Jogador:** ${interaction.user}

📌 **Assunto:** ${subject}

## 📝 DESCRIÇÃO

${description}

## 📊 STATUS

🟢 **ABERTO**

Aguarde até um membro da nossa equipe assumir seu atendimento.

Você receberá uma **mensagem privada** quando uma Staff começar a atender.

> ⭐ Aster • Support System`
                        )

                    )

                    .addActionRowComponents(
                        buttons
                    );


            await ticketChannel.send({

                content:
                    `${interaction.user}`,

                components: [
                    container
                ],

                flags:
                    MessageFlags.IsComponentsV2

            });


            // DM DE CONFIRMAÇÃO
            try {

                await interaction.user.send(
`# 🎫 TICKET CRIADO

Seu ticket no **Aster** foi criado com sucesso!

📌 **Assunto:** ${subject}

📂 **Categoria:** ${typeNames[type] || 'Support'}

🟢 **Status:** ABERTO

Nossa equipe irá analisar seu atendimento.

📩 Você receberá outra mensagem quando uma Staff assumir seu ticket.

> ⭐ Aster • Support System`
                );

            } catch {}


            return interaction.editReply({

                content:
                    `✅ Ticket criado com sucesso: ${ticketChannel}`

            });
        }


// ======================================================
// 🛡️ ASSUMIR TICKET
// ======================================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'ticket_claim'
        ) {

            if (
                !isStaff(
                    interaction.member
                )
            ) {

                return interaction.reply({

                    content:
                        '❌ Apenas membros da Staff podem assumir tickets.',

                    ephemeral: true

                });
            }


            const ownerId =
                interaction.channel.topic
                    ?.match(
                        /ticket-owner:(\d+)/
                    )?.[1];


            if (!ownerId) {

                return interaction.reply({

                    content:
                        '❌ Não consegui identificar o dono deste ticket.',

                    ephemeral: true

                });
            }


// ======================================================
// 🚫 EVITAR DUAS STAFF ASSUMINDO
// ======================================================

            if (
                interaction.channel.topic
                    ?.includes(
                        'status:claimed'
                    )
            ) {

                return interaction.reply({

                    content:
                        '⚠️ Este ticket já foi assumido por outro membro da equipe.',

                    ephemeral: true

                });
            }


            await interaction.channel.setTopic(
                interaction.channel.topic
                    .replace(
                        'status:open',
                        `status:claimed|staff:${interaction.user.id}`
                    )
            );


// ======================================================
// 📩 DM PARA O PLAYER
// ======================================================

            let dmSent = true;


            try {

                const ticketOwner =
                    await client.users.fetch(
                        ownerId
                    );


                await ticketOwner.send(
`# 🛡️ SEU TICKET ESTÁ SENDO ATENDIDO!

Olá ${ticketOwner}!

Um membro da equipe do **Aster** acabou de assumir seu ticket.

👮 **Staff responsável:** ${interaction.user}

🎫 **Ticket:** #${interaction.channel.name}

🟢 **Status:** EM ATENDIMENTO

Volte ao servidor para continuar a conversa com nossa equipe.

> ⭐ Aster • Support System`
                );

            } catch {

                dmSent = false;

            }


// ======================================================
// 🛡️ AVISO NO CANAL
// ======================================================

            const claimedContainer =
                new ContainerBuilder()

                    .setAccentColor(
                        0x00FF7F
                    )

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# 🛡️ TICKET ASSUMIDO

👮 **Staff responsável:** ${interaction.user}

🟢 **Status:** EM ATENDIMENTO

${dmSent
    ? '📩 O jogador foi avisado pela DM.'
    : '⚠️ Não consegui enviar DM para o jogador.'}

> ⭐ Aster • Support System`
                        )

                    );


            return interaction.reply({

                components: [
                    claimedContainer
                ],

                flags:
                    MessageFlags.IsComponentsV2

            });
        }


// ======================================================
// 🔒 FECHAR TICKET
// ======================================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'ticket_close'
        ) {

            const ownerId =
                interaction.channel.topic
                    ?.match(
                        /ticket-owner:(\d+)/
                    )?.[1];


            if (
                interaction.user.id !== ownerId &&
                !isStaff(interaction.member)
            ) {

                return interaction.reply({

                    content:
                        '❌ Apenas o jogador ou a Staff pode fechar este ticket.',

                    ephemeral: true

                });
            }


            const confirmButton =
                new ButtonBuilder()

                    .setCustomId(
                        'ticket_close_confirm'
                    )

                    .setLabel(
                        'Confirmar fechamento'
                    )

                    .setEmoji('✅')

                    .setStyle(
                        ButtonStyle.Danger
                    );


            const cancelButton =
                new ButtonBuilder()

                    .setCustomId(
                        'ticket_close_cancel'
                    )

                    .setLabel(
                        'Cancelar'
                    )

                    .setEmoji('❌')

                    .setStyle(
                        ButtonStyle.Secondary
                    );


            const row =
                new ActionRowBuilder()

                    .addComponents(
                        confirmButton,
                        cancelButton
                    );


            return interaction.reply({

                content:
                    '🔒 **Tem certeza que deseja fechar este ticket?**',

                components: [
                    row
                ],

                ephemeral: true

            });
        }


// ======================================================
// ❌ CANCELAR FECHAMENTO
// ======================================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'ticket_close_cancel'
        ) {

            return interaction.update({

                content:
                    '✅ Fechamento cancelado.',

                components: []

            });
        }


// ======================================================
// ✅ CONFIRMAR FECHAMENTO
// ======================================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'ticket_close_confirm'
        ) {

            const ownerId =
                interaction.channel.topic
                    ?.match(
                        /ticket-owner:(\d+)/
                    )?.[1];


            if (
                interaction.user.id !== ownerId &&
                !isStaff(interaction.member)
            ) {

                return interaction.reply({

                    content:
                        '❌ Você não possui permissão para fechar este ticket.',

                    ephemeral: true

                });
            }


// ======================================================
// 📩 AVISAR PLAYER
// ======================================================

            if (ownerId) {

                try {

                    const ticketOwner =
                        await client.users.fetch(
                            ownerId
                        );


                    await ticketOwner.send(
`# 🔒 TICKET FINALIZADO

Seu atendimento no **Aster** foi encerrado.

👮 **Fechado por:** ${interaction.user}

🎫 **Ticket:** #${interaction.channel.name}

🔴 **Status:** FECHADO

Caso precise novamente, você poderá abrir um novo ticket em nossa Central de Suporte.

Obrigado por utilizar nosso suporte!

> ⭐ Aster • Support System`
                    );

                } catch {}
            }


            await interaction.update({

                content:
`# 🔒 TICKET FINALIZADO

👮 Fechado por ${interaction.user}

⏳ Este canal será apagado em **5 segundos**.`,

                components: []

            });


            setTimeout(
                async () => {

                    await interaction.channel
                        .delete(
                            `Ticket fechado por ${interaction.user.tag}`
                        )
                        .catch(() => {});

                },
                5000
            );


            return;
        }


// ======================================================
// 📝 INICIAR CANDIDATURA
// ======================================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            'aster_apply'
        ) {

            const user =
                interaction.user;


            if (
                applicationsInProgress.has(
                    user.id
                )
            ) {

                return interaction.reply({

                    content:
                        '⚠️ Você já está preenchendo uma candidatura.',

                    ephemeral: true

                });
            }


            let dm;


            try {

                dm =
                    await user.createDM();


                await dm.send(
`# ⭐ RECRUTAMENTO ASTER

Olá ${user}!

Bem-vindo ao processo de recrutamento da equipe **Aster**.

Vou fazer algumas perguntas para você.

Responda uma por uma com calma e sinceridade.

> Digite **cancelar** a qualquer momento para cancelar sua candidatura.

Boa sorte! ⚔️`
                );

            } catch {

                return interaction.reply({

                    content:
                        '❌ Não consegui enviar uma DM. Ative suas mensagens privadas e tente novamente.',

                    ephemeral: true

                });
            }


            await interaction.reply({

                content:
                    '📩 Te enviei uma mensagem privada! Continue sua candidatura pela DM.',

                ephemeral: true

            });


            applicationsInProgress.add(
                user.id
            );


            const questions = [

                '🎮 **1/7 — Qual é o seu nick no Minecraft?**',

                '🎂 **2/7 — Qual é a sua idade?**',

`🛡️ **3/7 — Para qual cargo você está se candidatando?**

• Staff
• Admin
• Moderador
• Builder
• Developer`,

`📋 **4/7 — Você já teve experiência como Staff anteriormente?**

Se sim, diga em quais servidores e quais cargos você já ocupou.`,

`⏰ **5/7 — Quanto tempo você consegue ficar ativo no Aster?**

Exemplos:
• 2 horas por dia
• 4 horas por dia
• Apenas finais de semana`,

                '🤝 **6/7 — Por que você quer entrar para a equipe do Aster?**',

                '⭐ **7/7 — Por que deveríamos escolher você para fazer parte da equipe?**'

            ];


            const answers = [];


            try {

                for (
                    const question
                    of questions
                ) {

                    await dm.send(
                        question
                    );


                    const collected =
                        await dm.awaitMessages({

                            filter:
                                message =>
                                    message.author.id ===
                                    user.id,

                            max: 1,

                            time:
                                5 * 60 * 1000,

                            errors: [
                                'time'
                            ]

                        });


                    const answer =
                        collected
                            .first()
                            .content
                            .trim();


                    if (
                        answer.toLowerCase() ===
                            'cancel' ||

                        answer.toLowerCase() ===
                            'cancelar'
                    ) {

                        await dm.send(
                            '❌ Sua candidatura foi cancelada.'
                        );


                        applicationsInProgress.delete(
                            user.id
                        );


                        return;
                    }


                    answers.push(
                        answer
                    );


                    await dm.send(
                        '✅ **Resposta salva!**'
                    );
                }


// ======================================================
// 💾 SALVAR CANDIDATURA
// ======================================================

                applications.set(
                    user.id,
                    {

                        minecraftNick:
                            answers[0],

                        age:
                            answers[1],

                        position:
                            answers[2],

                        experience:
                            answers[3],

                        availability:
                            answers[4],

                        reason:
                            answers[5],

                        whyChoose:
                            answers[6]

                    }
                );


                const reviewChannel =
                    await client.channels.fetch(
                        APPLICATION_REVIEW_CHANNEL_ID
                    );


                const skinHead =
                    `https://mc-heads.net/avatar/${encodeURIComponent(answers[0])}/128`;


                const acceptButton =
                    new ButtonBuilder()

                        .setCustomId(
                            `application_accept_${user.id}`
                        )

                        .setLabel(
                            'Aceitar'
                        )

                        .setEmoji('✅')

                        .setStyle(
                            ButtonStyle.Success
                        );


                const rejectButton =
                    new ButtonBuilder()

                        .setCustomId(
                            `application_reject_${user.id}`
                        )

                        .setLabel(
                            'Rejeitar'
                        )

                        .setEmoji('❌')

                        .setStyle(
                            ButtonStyle.Danger
                        );


                const buttons =
                    new ActionRowBuilder()

                        .addComponents(
                            acceptButton,
                            rejectButton
                        );


                const applicationContainer =
                    new ContainerBuilder()

                        .setAccentColor(
                            0x7B2EFF
                        )

                        .addMediaGalleryComponents(

                            new MediaGalleryBuilder()
                                .addItems(

                                    new MediaGalleryItemBuilder()
                                        .setURL(
                                            skinHead
                                        )

                                )

                        )

                        .addTextDisplayComponents(

                            new TextDisplayBuilder().setContent(
`# 📋 NOVA CANDIDATURA ASTER

## 👤 CANDIDATO

${user}

**Discord:** ${user.tag}

**ID:** \`${user.id}\`

## 🎮 NICK NO MINECRAFT

${answers[0]}

## 🎂 IDADE

${answers[1]}

## 🛡️ CARGO DESEJADO

${answers[2]}

## 📋 EXPERIÊNCIA ANTERIOR

${answers[3]}

## ⏰ DISPONIBILIDADE

${answers[4]}

## 🤝 POR QUE QUER ENTRAR NO ASTER?

${answers[5]}

## ⭐ POR QUE DEVEMOS ESCOLHER VOCÊ?

${answers[6]}

> ⭐ Aster • Sistema de Recrutamento`
                            )

                        )

                        .addActionRowComponents(
                            buttons
                        );


                await reviewChannel.send({

                    components: [
                        applicationContainer
                    ],

                    flags:
                        MessageFlags.IsComponentsV2

                });


                await dm.send(
`# ✅ CANDIDATURA ENVIADA!

Sua candidatura foi enviada para a administração do **Aster**.

Agora é só aguardar nossa análise.

Você receberá o resultado pela sua DM.

> ⭐ Aster • Recrutamento`
                );


            } catch {

                try {

                    await dm.send(
`# ⏰ CANDIDATURA ENCERRADA

O tempo para responder terminou.

Caso queira tentar novamente, volte ao painel de recrutamento do **Aster**.

> ⭐ Aster • Recrutamento`
                    );

                } catch {}
            }


            applicationsInProgress.delete(
                user.id
            );


            return;
        }


// ======================================================
// ✅ ACEITAR / ❌ REJEITAR CANDIDATURA
// ======================================================

        if (
            interaction.isButton() &&

            (
                interaction.customId.startsWith(
                    'application_accept_'
                ) ||

                interaction.customId.startsWith(
                    'application_reject_'
                )
            )
        ) {

            if (
                !isAdmin(
                    interaction.member
                )
            ) {

                return interaction.reply({

                    content:
                        '❌ Apenas Owner/Admin pode analisar candidaturas.',

                    ephemeral: true

                });
            }


            const accepted =
                interaction.customId.startsWith(
                    'application_accept_'
                );


            const userId =
                interaction.customId

                    .replace(
                        'application_accept_',
                        ''
                    )

                    .replace(
                        'application_reject_',
                        ''
                    );


            const application =
                applications.get(
                    userId
                );


            if (!application) {

                return interaction.reply({

                    content:
                        '❌ Não encontrei os dados dessa candidatura. Talvez o bot tenha reiniciado.',

                    ephemeral: true

                });
            }


            const candidate =
                await client.users.fetch(
                    userId
                );


            const skinHead =
                `https://mc-heads.net/avatar/${encodeURIComponent(application.minecraftNick)}/128`;


// ======================================================
// 📩 RESULTADO NA DM
// ======================================================

            try {

                if (accepted) {

                    await candidate.send(
`# 🎉 CANDIDATURA ACEITA!

Parabéns ${candidate}!

Sua candidatura para entrar na equipe do **Aster** foi **ACEITA**. ✅

🎮 **Nick:** ${application.minecraftNick}

🛡️ **Cargo:** ${application.position}

Um administrador entrará em contato com você.

Bem-vindo à equipe! ⭐⚔️

> Aster • Recrutamento`
                    );

                } else {

                    await candidate.send(
`# ❌ RESULTADO DA CANDIDATURA

Olá ${candidate}.

Obrigado pelo interesse em fazer parte da equipe do **Aster**.

Após analisarmos sua candidatura, infelizmente ela **não foi aprovada desta vez**.

🎮 **Nick:** ${application.minecraftNick}

🛡️ **Cargo:** ${application.position}

Você poderá tentar novamente em outra oportunidade.

> ⭐ Aster • Recrutamento`
                    );
                }

            } catch {}


// ======================================================
// 📋 RESULTADO
// ======================================================

            const resultContainer =
                new ContainerBuilder()

                    .setAccentColor(
                        accepted
                            ? 0x00FF7F
                            : 0xFF0000
                    )

                    .addMediaGalleryComponents(

                        new MediaGalleryBuilder()
                            .addItems(

                                new MediaGalleryItemBuilder()
                                    .setURL(
                                        skinHead
                                    )

                            )

                    )

                    .addTextDisplayComponents(

                        new TextDisplayBuilder().setContent(
`# ${accepted ? '✅ CANDIDATURA ACEITA' : '❌ CANDIDATURA REJEITADA'}

👤 **Candidato:** ${candidate}

🎮 **Minecraft:** ${application.minecraftNick}

🎂 **Idade:** ${application.age}

🛡️ **Cargo:** ${application.position}

👮 **Analisado por:** ${interaction.user}

📋 **Resultado:** ${accepted ? 'APROVADO' : 'REJEITADO'}

> ⭐ Aster • Recruitment Reviews`
                        )

                    );


            await interaction.update({

                components: [
                    resultContainer
                ]

            });


// ======================================================
// 📋 LOG FINAL
// ======================================================

            try {

                const logChannel =
                    await client.channels.fetch(
                        REVIEW_LOG_CHANNEL_ID
                    );


                if (
                    logChannel &&
                    logChannel.isTextBased()
                ) {

                    const logContainer =
                        new ContainerBuilder()

                            .setAccentColor(
                                accepted
                                    ? 0x00FF7F
                                    : 0xFF0000
                            )

                            .addMediaGalleryComponents(

                                new MediaGalleryBuilder()
                                    .addItems(

                                        new MediaGalleryItemBuilder()
                                            .setURL(
                                                skinHead
                                            )

                                    )

                            )

                            .addTextDisplayComponents(

                                new TextDisplayBuilder().setContent(
`# 📋 RESULTADO DO RECRUTAMENTO

👤 **Candidato:** ${candidate}

🎮 **Minecraft:** ${application.minecraftNick}

🎂 **Idade:** ${application.age}

🛡️ **Cargo desejado:** ${application.position}

👮 **Administrador:** ${interaction.user}

${accepted
    ? '✅ **RESULTADO: APROVADO**'
    : '❌ **RESULTADO: REJEITADO**'}

> ⭐ Aster • Recruitment Logs`
                                )

                            );


                    await logChannel.send({

                        components: [
                            logContainer
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });
                }

            } catch (error) {

                console.error(
                    '❌ Erro no log da candidatura:',
                    error
                );
            }


            applications.delete(
                userId
            );


            return;
        }


    } catch (error) {

        console.error(
            '❌ ERRO DE INTERAÇÃO:',
            error
        );


        if (
            interaction.isRepliable() &&
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({

                content:
                    '❌ Ocorreu um erro no sistema do Aster.',

                ephemeral: true

            }).catch(() => {});
        }
    }
});


// ======================================================
// ❌ ERROS
// ======================================================

client.on('error', error => {

    console.error(
        '❌ Discord:',
        error
    );

});


process.on(
    'unhandledRejection',
    error => {

        console.error(
            '❌ Promise não tratada:',
            error
        );

    }
);


// ======================================================
// 🔐 LOGIN
// ======================================================

client.login(
    process.env.DISCORD_TOKEN
);
