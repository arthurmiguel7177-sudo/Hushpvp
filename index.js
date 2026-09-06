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

const {
    joinVoiceChannel
} = require('@discordjs/voice');

const express = require('express');


// ======================================================
// 🐺 HUSHPVP CONFIG
// ======================================================

const GUILD_ID =
    '1545935454694670378';


// 📝 RECRUTAMENTO
const RECRUITMENT_CHANNEL_ID =
    '1545962982385647687';

const APPLICATION_REVIEW_CHANNEL_ID =
    '1545963991736524840';

const REVIEW_LOG_CHANNEL_ID =
    '1545956902826151956';


// 🎫 PAINEL DE TICKETS
const TICKET_PANEL_CHANNEL_ID =
    '1545956394342289478';


// Categoria criada automaticamente
const TICKET_CATEGORY_NAME =
    'HUSHPVP TICKETS';


// ======================================================
// 💾 MEMÓRIA
// ======================================================

const applicationsInProgress =
    new Set();

const applications =
    new Map();

const ticketSelections =
    new Map();


// ======================================================
// 🌐 EXPRESS
// ======================================================

const app = express();

const PORT =
    process.env.PORT || 3000;


app.get('/', (req, res) => {

    res.send(
        '🐺 HushPvP Bot Online!'
    );

});


app.listen(PORT, () => {

    console.log(
        `🌐 Servidor web na porta ${PORT}`
    );

});


// ======================================================
// 🤖 CLIENT
// ======================================================

const client =
    new Client({

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


    // Administrador sempre pode
    if (
        member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    ) {

        return true;

    }


    return member.roles.cache.some(
        role =>
            STAFF_ROLE_NAMES.includes(
                role.name.toLowerCase()
            )
    );

}


// ======================================================
// 👑 OWNER / ADMIN
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


    const roles = [

        'owner',
        'owners',
        'admin',
        'admins',
        'administrator'

    ];


    return member.roles.cache.some(
        role =>
            roles.includes(
                role.name.toLowerCase()
            )
    );

}


// ======================================================
// ⏰ CONVERTER TEMPO DO MUTE
// ======================================================

function parseDuration(input) {

    if (!input) return null;


    const match =
        input
            .toLowerCase()
            .match(
                /^(\d+)(s|m|h|d)$/
            );


    if (!match) return null;


    const value =
        Number(match[1]);

    const unit =
        match[2];


    const units = {

        s: 1000,

        m: 60 * 1000,

        h: 60 * 60 * 1000,

        d: 24 * 60 * 60 * 1000

    };


    return value * units[unit];

}


// ======================================================
// ⚔️ SLASH COMMANDS
// ======================================================

const teamCommand =
    new SlashCommandBuilder()

        .setName('team')

        .setDescription(
            'Mostra a equipe oficial do HushPvP'
        );


// ======================================================

const statusOnCommand =
    new SlashCommandBuilder()

        .setName('statuson')

        .setDescription(
            'Define o servidor Minecraft como online'
        );


// ======================================================

const statusOffCommand =
    new SlashCommandBuilder()

        .setName('statusoff')

        .setDescription(
            'Define o servidor Minecraft como offline'
        );


// ======================================================
// 🔨 BAN
// ======================================================

const banCommand =
    new SlashCommandBuilder()

        .setName('ban')

        .setDescription(
            'Bane um usuário do servidor'
        )

        .addUserOption(
            option =>

                option

                    .setName(
                        'usuario'
                    )

                    .setDescription(
                        'Usuário que será banido'
                    )

                    .setRequired(
                        true
                    )
        )

        .addStringOption(
            option =>

                option

                    .setName(
                        'motivo'
                    )

                    .setDescription(
                        'Motivo da punição'
                    )

                    .setRequired(
                        true
                    )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        );


// ======================================================
// 👢 KICK
// ======================================================

const kickCommand =
    new SlashCommandBuilder()

        .setName('kick')

        .setDescription(
            'Expulsa um usuário do servidor'
        )

        .addUserOption(
            option =>

                option

                    .setName(
                        'usuario'
                    )

                    .setDescription(
                        'Usuário'
                    )

                    .setRequired(
                        true
                    )
        )

        .addStringOption(
            option =>

                option

                    .setName(
                        'motivo'
                    )

                    .setDescription(
                        'Motivo'
                    )

                    .setRequired(
                        true
                    )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
        );


// ======================================================
// 🔇 MUTE
// ======================================================

const muteCommand =
    new SlashCommandBuilder()

        .setName('mute')

        .setDescription(
            'Silencia um usuário'
        )

        .addUserOption(
            option =>

                option

                    .setName(
                        'usuario'
                    )

                    .setDescription(
                        'Usuário'
                    )

                    .setRequired(
                        true
                    )
        )

        .addStringOption(
            option =>

                option

                    .setName(
                        'tempo'
                    )

                    .setDescription(
                        'Ex: 10m, 1h, 1d'
                    )

                    .setRequired(
                        true
                    )
        )

        .addStringOption(
            option =>

                option

                    .setName(
                        'motivo'
                    )

                    .setDescription(
                        'Motivo'
                    )

                    .setRequired(
                        true
                    )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        );


// ======================================================
// 🔊 UNMUTE
// ======================================================

const unmuteCommand =
    new SlashCommandBuilder()

        .setName('unmute')

        .setDescription(
            'Remove o mute de um usuário'
        )

        .addUserOption(
            option =>

                option

                    .setName(
                        'usuario'
                    )

                    .setDescription(
                        'Usuário'
                    )

                    .setRequired(
                        true
                    )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        );


// ======================================================
// 🎫 PEGAR/CRIAR CATEGORIA DE TICKETS
// ======================================================

async function getTicketCategory(
    guild
) {

    let category =
        guild.channels.cache.find(

            channel =>

                channel.type ===
                    ChannelType.GuildCategory &&

                channel.name ===
                    TICKET_CATEGORY_NAME

        );


    if (!category) {

        category =
            await guild.channels.create({

                name:
                    TICKET_CATEGORY_NAME,

                type:
                    ChannelType.GuildCategory

            });


        console.log(
            '✅ Categoria de tickets criada!'
        );

    }


    return category;

}


// ======================================================
// 🎫 PAINEL DE TICKETS
// ======================================================

async function sendTicketPanel() {

    try {

        const channel =
            await client.channels.fetch(
                TICKET_PANEL_CHANNEL_ID
            );


        if (
            !channel ||
            !channel.isTextBased()
        ) {

            console.log(
                '❌ Canal de ticket inválido.'
            );

            return;

        }


        // ==============================================
        // 🧹 APAGAR PAINEL ANTIGO
        // ==============================================

        try {

            const messages =
                await channel.messages.fetch({
                    limit: 30
                });


            const botMessages =
                messages.filter(

                    message =>
                        message.author.id ===
                        client.user.id

                );


            for (
                const message
                of botMessages.values()
            ) {

                await message
                    .delete()
                    .catch(() => {});

            }

        } catch {}


        // ==============================================
        // 🔘 BOTÃO
        // ==============================================

        const button =
            new ButtonBuilder()

                .setCustomId(
                    'ticket_start'
                )

                .setLabel(
                    'Iniciar Ticket'
                )

                .setEmoji(
                    '🎫'
                )

                .setStyle(
                    ButtonStyle.Primary
                );


        const row =
            new ActionRowBuilder()

                .addComponents(
                    button
                );


        const container =
            new ContainerBuilder()

                .setAccentColor(
                    0x009DFF
                )

                .addTextDisplayComponents(

                    new TextDisplayBuilder()
                        .setContent(
`# 🐺 HUSHPVP • CENTRAL DE SUPORTE

## 🎫 Precisa de ajuda?

Nossa equipe está disponível para ajudar você com problemas, dúvidas e suporte relacionado ao **HushPvP**.

### 📂 Tipos de atendimento

🎫 **Support**
Problemas gerais relacionados ao servidor.

🆘 **Ajuda**
Precisa da ajuda de um membro da equipe?

❓ **Dúvida**
Possui alguma dúvida sobre o HushPvP?

### ⚠️ Atenção

• Não abra tickets sem necessidade
• Explique seu problema corretamente
• Respeite nossa equipe
• Não marque membros da staff desnecessariamente
• Aguarde até alguém atender você

📩 **Clique em Iniciar Ticket para começar.**

> 🐺 HushPvP • Support System`
                        )

                )

                .addActionRowComponents(
                    row
                );


        await channel.send({

            components: [
                container
            ],

            flags:
                MessageFlags.IsComponentsV2

        });


        console.log(
            '🎫 Painel de tickets enviado!'
        );


    } catch (error) {

        console.error(
            '❌ Erro no painel de ticket:',
            error
        );

    }

}


// ======================================================
// 📝 PAINEL RECRUTAMENTO
// ======================================================

async function sendRecruitmentPanel() {

    try {

        const channel =
            await client.channels.fetch(
                RECRUITMENT_CHANNEL_ID
            );


        if (
            !channel ||
            !channel.isTextBased()
        ) return;


        try {

            const messages =
                await channel.messages.fetch({
                    limit: 20
                });


            const botMessages =
                messages.filter(
                    m =>
                        m.author.id ===
                        client.user.id
                );


            for (
                const message
                of botMessages.values()
            ) {

                await message
                    .delete()
                    .catch(() => {});

            }

        } catch {}


        const button =
            new ButtonBuilder()

                .setCustomId(
                    'hushpvp_apply'
                )

                .setLabel(
                    'Enviar candidatura'
                )

                .setEmoji(
                    '📝'
                )

                .setStyle(
                    ButtonStyle.Primary
                );


        const row =
            new ActionRowBuilder()

                .addComponents(
                    button
                );


        const container =
            new ContainerBuilder()

                .setAccentColor(
                    0x009DFF
                )

                .addTextDisplayComponents(

                    new TextDisplayBuilder()
                        .setContent(
`# 📝 RECRUTAMENTO HUSHPVP

## Processo de Recrutamento

Quer fazer parte da equipe do **HushPvP**?

### ✅ Requisitos

• Boa comunicação
• Maturidade
• Respeito
• Atividade
• Trabalho em equipe
• Compromisso

📩 **Clique abaixo para iniciar sua candidatura pela DM.**

> 🐺 HushPvP • Recrutamento`
                        )

                )

                .addActionRowComponents(
                    row
                );


        await channel.send({

            components: [
                container
            ],

            flags:
                MessageFlags.IsComponentsV2

        });


    } catch (error) {

        console.error(
            error
        );

    }

}


// ======================================================
// 🚀 READY
// ======================================================

client.once(
    'ready',
    async () => {

        console.log(
            '======================================'
        );

        console.log(
            `🐺 HushPvP Online — ${client.user.tag}`
        );

        console.log(
            '👑 Sistema criado para xrayvenz'
        );

        console.log(
            '======================================'
        );


        // ==============================================
        // 🎮 PRESENÇA
        // ==============================================

        client.user.setPresence({

            activities: [

                {

                    name:
                        'HushPvP ⚔️',

                    type:
                        ActivityType.Playing

                }

            ],

            status:
                'online'

        });


        // ==============================================
        // 📜 REGISTRAR COMANDOS
        // ==============================================

        try {

            const guild =
                await client.guilds.fetch(
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
                '✅ Slash commands registrados!'
            );

        } catch (error) {

            console.error(
                '❌ Erro nos comandos:',
                error
            );

        }


        // ==============================================
        // 🔊 VOICE
        // ==============================================

        if (
            process.env.CHANNEL_ID
        ) {

            try {

                const voice =
                    await client.channels.fetch(
                        process.env.CHANNEL_ID
                    );


                if (
                    voice &&
                    voice.isVoiceBased()
                ) {

                    joinVoiceChannel({

                        channelId:
                            voice.id,

                        guildId:
                            voice.guild.id,

                        adapterCreator:
                            voice.guild
                                .voiceAdapterCreator,

                        selfDeaf:
                            true,

                        selfMute:
                            false

                    });

                }

            } catch (error) {

                console.error(
                    error
                );

            }

        }


        // ==============================================
        // 📜 REGRAS
        // ==============================================

        if (
            process.env.CANAL_REGRAS_ID
        ) {

            try {

                const rulesChannel =
                    await client.channels.fetch(
                        process.env
                            .CANAL_REGRAS_ID
                    );


                if (
                    rulesChannel &&
                    rulesChannel.isTextBased()
                ) {

                    const banner =
                        new AttachmentBuilder(
                            './regras.png',
                            {
                                name:
                                    'regras.png'
                            }
                        );


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0x009DFF
                            )

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

> To maintain a fair, competitive and enjoyable environment, all players must follow the rules.

# 🔇 CHAT MUTES
• Unauthorized links
• Advertising
• Spam
• Toxic behavior
• Inappropriate content

# ⛔ PERMANENT CHAT MUTES
• Harassment
• Threats
• Racist or hateful speech
• NSFW content

# 👢 KICKS
• False reports
• Disruptive behavior
• Interfering with staff

# 🚫 PERMANENT BANS
• Cheats
• Hacks
• Exploiting bugs
• DDoS threats
• Ban evasion
• Impersonating staff

# ⏳ TEMPORARY BANS
• Bug abuse
• Match fixing
• Stat boosting
• Unsportsmanlike behavior

> 🐺 **HushPvP**
> Play fair • Respect others • Stay competitive ⚔️`
                                    )

                            );


                    await rulesChannel.send({

                        components: [
                            container
                        ],

                        files: [
                            banner
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }

            } catch (error) {

                console.error(
                    '❌ Regras:',
                    error
                );

            }

        }


        // ==============================================
        // 🎫 PAINÉIS
        // ==============================================

        await sendTicketPanel();

        await sendRecruitmentPanel();

    }
);


// ======================================================
// 🧠 INTERAÇÕES
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        try {

            // ==================================================
            // ⚔️ SLASH COMMANDS
            // ==================================================

            if (
                interaction.isChatInputCommand()
            ) {

                // ==========================================
                // /TEAM
                // ==========================================

                if (
                    interaction.commandName ===
                    'team'
                ) {

                    await interaction
                        .guild
                        .members
                        .fetch();


                    const roleMembers =
                        names => {

                            const members =
                                new Map();


                            interaction
                                .guild
                                .roles
                                .cache
                                .filter(
                                    role =>
                                        names.includes(
                                            role.name
                                                .toLowerCase()
                                        )
                                )
                                .forEach(
                                    role => {

                                        role.members
                                            .forEach(
                                                member =>

                                                    members.set(
                                                        member.id,
                                                        member
                                                    )

                                            );

                                    }
                                );


                            return [
                                ...members.values()
                            ];

                        };


                    const owners =
                        roleMembers([
                            'owner',
                            'owners'
                        ]);


                    const admins =
                        roleMembers([
                            'admin',
                            'admins',
                            'administrator'
                        ]);


                    const staffs =
                        roleMembers([
                            'staff',
                            'staffs',
                            'moderador',
                            'moderator'
                        ]);


                    const format =
                        members =>
                            members.length
                                ? members
                                    .map(
                                        m =>
                                            `• ${m}`
                                    )
                                    .join('\n')
                                : '• Nenhum membro';


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0x009DFF
                            )

                            .addTextDisplayComponents(

                                new TextDisplayBuilder()
                                    .setContent(
`# 🐺 HUSHPVP TEAM

# 👑 OWNER
${format(owners)}

# 🛡️ ADMIN
${format(admins)}

# ⚔️ STAFF
${format(staffs)}

> 💙 HushPvP • Equipe Oficial`
                                    )

                            );


                    return interaction.reply({

                        components: [
                            container
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }


                // ==========================================
                // 🟢 STATUS ONLINE
                // ==========================================

                if (
                    interaction.commandName ===
                    'statuson'
                ) {

                    if (
                        !isAdmin(
                            interaction.member
                        )
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Apenas Owner/Admin.',

                            ephemeral:
                                true

                        });

                    }


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0x00FF7F
                            )

                            .addTextDisplayComponents(

                                new TextDisplayBuilder()
                                    .setContent(
`# 🟢 HUSHPVP STATUS

## ✅ SERVIDOR ONLINE

O servidor Minecraft do **HushPvP** está ligado!

🎮 **Status:** \`ONLINE\`

⚡ Entre agora e venha jogar!

> 🐺 HushPvP • Server Status`
                                    )

                            );


                    return interaction.reply({

                        components: [
                            container
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }


                // ==========================================
                // 🔴 STATUS OFFLINE
                // ==========================================

                if (
                    interaction.commandName ===
                    'statusoff'
                ) {

                    if (
                        !isAdmin(
                            interaction.member
                        )
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Apenas Owner/Admin.',

                            ephemeral:
                                true

                        });

                    }


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0xFF0000
                            )

                            .addTextDisplayComponents(

                                new TextDisplayBuilder()
                                    .setContent(
`# 🔴 HUSHPVP STATUS

## ❌ SERVIDOR OFFLINE

O servidor Minecraft do **HushPvP** está desligado ou em manutenção.

🎮 **Status:** \`OFFLINE\`

🔧 Aguarde até o servidor retornar.

> 🐺 HushPvP • Server Status`
                                    )

                            );


                    return interaction.reply({

                        components: [
                            container
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }


                // ==========================================
                // 🔨 /BAN
                // ==========================================

                if (
                    interaction.commandName ===
                    'ban'
                ) {

                    if (
                        !interaction.member.permissions.has(
                            PermissionFlagsBits.BanMembers
                        )
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Você não possui permissão para banir membros.',

                            ephemeral:
                                true

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
                                '❌ Você não pode se banir.',

                            ephemeral:
                                true

                        });

                    }


                    try {

                        await user.send(
`# 🔨 VOCÊ FOI BANIDO

Você foi banido do servidor **HushPvP**.

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

> 🐺 HushPvP • Moderation`
                        );

                    } catch {}


                    await interaction.guild
                        .members
                        .ban(
                            user.id,
                            {
                                reason:
                                    `${reason} | Staff: ${interaction.user.tag}`
                            }
                        );


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0xFF0000
                            )

                            .addTextDisplayComponents(

                                new TextDisplayBuilder()
                                    .setContent(
`# 🔨 USUÁRIO BANIDO

👤 **Usuário:** ${user}

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

🔴 **Punição:** BAN

> 🐺 HushPvP • Moderation`
                                    )

                            );


                    return interaction.reply({

                        components: [
                            container
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }


                // ==========================================
                // 👢 /KICK
                // ==========================================

                if (
                    interaction.commandName ===
                    'kick'
                ) {

                    const member =
                        interaction.options
                            .getMember(
                                'usuario'
                            );


                    const reason =
                        interaction.options
                            .getString(
                                'motivo'
                            );


                    if (
                        !member
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Usuário não encontrado no servidor.',

                            ephemeral:
                                true

                        });

                    }


                    if (
                        !member.kickable
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Não consigo expulsar esse membro. Confira a posição dos cargos.',

                            ephemeral:
                                true

                        });

                    }


                    try {

                        await member.send(
`# 👢 VOCÊ FOI EXPULSO

Você foi expulso do **HushPvP**.

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

> 🐺 HushPvP • Moderation`
                        );

                    } catch {}


                    await member.kick(
                        `${reason} | ${interaction.user.tag}`
                    );


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0xFF8C00
                            )

                            .addTextDisplayComponents(

                                new TextDisplayBuilder()
                                    .setContent(
`# 👢 USUÁRIO EXPULSO

👤 **Usuário:** ${member.user.tag}

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

🟠 **Punição:** KICK

> 🐺 HushPvP • Moderation`
                                    )

                            );


                    return interaction.reply({

                        components: [
                            container
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }


                // ==========================================
                // 🔇 /MUTE
                // ==========================================

                if (
                    interaction.commandName ===
                    'mute'
                ) {

                    const member =
                        interaction.options
                            .getMember(
                                'usuario'
                            );


                    const time =
                        interaction.options
                            .getString(
                                'tempo'
                            );


                    const reason =
                        interaction.options
                            .getString(
                                'motivo'
                            );


                    if (!member) {

                        return interaction.reply({

                            content:
                                '❌ Usuário não encontrado.',

                            ephemeral:
                                true

                        });

                    }


                    const duration =
                        parseDuration(
                            time
                        );


                    if (!duration) {

                        return interaction.reply({

                            content:
                                '❌ Tempo inválido. Use `10m`, `1h`, `1d` etc.',

                            ephemeral:
                                true

                        });

                    }


                    const MAX_TIMEOUT =
                        28 *
                        24 *
                        60 *
                        60 *
                        1000;


                    if (
                        duration >
                        MAX_TIMEOUT
                    ) {

                        return interaction.reply({

                            content:
                                '❌ O mute máximo do Discord é de 28 dias.',

                            ephemeral:
                                true

                        });

                    }


                    if (
                        !member.moderatable
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Não consigo mutar esse membro. Verifique os cargos.',

                            ephemeral:
                                true

                        });

                    }


                    await member.timeout(
                        duration,
                        `${reason} | ${interaction.user.tag}`
                    );


                    try {

                        await member.send(
`# 🔇 VOCÊ FOI MUTADO

Você recebeu um mute no **HushPvP**.

⏰ **Tempo:** ${time}

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

> 🐺 HushPvP • Moderation`
                        );

                    } catch {}


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0xFFD700
                            )

                            .addTextDisplayComponents(

                                new TextDisplayBuilder()
                                    .setContent(
`# 🔇 USUÁRIO MUTADO

👤 **Usuário:** ${member}

⏰ **Tempo:** ${time}

👮 **Staff:** ${interaction.user}

📋 **Motivo:** ${reason}

🟡 **Punição:** MUTE

> 🐺 HushPvP • Moderation`
                                    )

                            );


                    return interaction.reply({

                        components: [
                            container
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }


                // ==========================================
                // 🔊 /UNMUTE
                // ==========================================

                if (
                    interaction.commandName ===
                    'unmute'
                ) {

                    const member =
                        interaction.options
                            .getMember(
                                'usuario'
                            );


                    if (!member) {

                        return interaction.reply({

                            content:
                                '❌ Usuário não encontrado.',

                            ephemeral:
                                true

                        });

                    }


                    if (
                        !member.moderatable
                    ) {

                        return interaction.reply({

                            content:
                                '❌ Não consigo remover o mute desse membro.',

                            ephemeral:
                                true

                        });

                    }


                    await member.timeout(
                        null,
                        `Unmute por ${interaction.user.tag}`
                    );


                    return interaction.reply({

                        content:
                            `🔊 ${member} teve o mute removido por ${interaction.user}.`

                    });

                }

            }


// ======================================================
// 🎫 BOTÃO "INICIAR TICKET"
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                'ticket_start'
            ) {

                // ==========================================
                // 🚫 VERIFICAR TICKET EXISTENTE
                // ==========================================

                const existing =
                    interaction.guild
                        .channels
                        .cache
                        .find(

                            channel =>

                                channel.type ===
                                    ChannelType.GuildText &&

                                channel.topic &&
                                channel.topic.includes(
                                    `ticket-owner:${interaction.user.id}`
                                )

                        );


                if (
                    existing
                ) {

                    return interaction.reply({

                        content:
                            `⚠️ Você já possui um ticket aberto: ${existing}`,

                        ephemeral:
                            true

                    });

                }


                // ==========================================
                // 📂 MENU
                // ==========================================

                const menu =
                    new StringSelectMenuBuilder()

                        .setCustomId(
                            'ticket_type'
                        )

                        .setPlaceholder(
                            'Escolha o motivo do ticket'
                        )

                        .addOptions(

                            {

                                label:
                                    'Support',

                                description:
                                    'Problemas gerais no servidor',

                                value:
                                    'support',

                                emoji:
                                    '🎫'

                            },

                            {

                                label:
                                    'Ajuda',

                                description:
                                    'Preciso de ajuda da equipe',

                                value:
                                    'ajuda',

                                emoji:
                                    '🆘'

                            },

                            {

                                label:
                                    'Dúvida',

                                description:
                                    'Tenho uma dúvida',

                                value:
                                    'duvida',

                                emoji:
                                    '❓'

                            }

                        );


                const row =
                    new ActionRowBuilder()
                        .addComponents(
                            menu
                        );


                return interaction.reply({

                    content:
                        '🐺 **HushPvP Support**\n\nEscolha o motivo do seu atendimento:',

                    components: [
                        row
                    ],

                    ephemeral:
                        true

                });

            }


// ======================================================
// 📂 SELECIONAR TIPO DO TICKET
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


                // ==========================================
                // 🪟 POP-UP
                // ==========================================

                const modal =
                    new ModalBuilder()

                        .setCustomId(
                            'ticket_modal'
                        )

                        .setTitle(
                            'HushPvP • Abrir Ticket'
                        );


                const titleInput =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_subject'
                        )

                        .setLabel(
                            'Qual o assunto?'
                        )

                        .setPlaceholder(
                            'Ex: Problema para entrar no servidor'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            100
                        );


                const descriptionInput =
                    new TextInputBuilder()

                        .setCustomId(
                            'ticket_description'
                        )

                        .setLabel(
                            'Explique o que aconteceu'
                        )

                        .setPlaceholder(
                            'Conte todos os detalhes para nossa equipe...'
                        )

                        .setStyle(
                            TextInputStyle.Paragraph
                        )

                        .setRequired(
                            true
                        )

                        .setMaxLength(
                            1000
                        );


                const row1 =
                    new ActionRowBuilder()
                        .addComponents(
                            titleInput
                        );


                const row2 =
                    new ActionRowBuilder()
                        .addComponents(
                            descriptionInput
                        );


                modal.addComponents(
                    row1,
                    row2
                );


                return interaction.showModal(
                    modal
                );

            }


// ======================================================
// 🪟 CRIAR TICKET DEPOIS DO POP-UP
// ======================================================

            if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                'ticket_modal'
            ) {

                await interaction.deferReply({

                    ephemeral:
                        true

                });


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


                const existing =
                    interaction.guild
                        .channels
                        .cache
                        .find(

                            channel =>

                                channel.type ===
                                    ChannelType.GuildText &&

                                channel.topic &&
                                channel.topic.includes(
                                    `ticket-owner:${interaction.user.id}`
                                )

                        );


                if (
                    existing
                ) {

                    return interaction.editReply({

                        content:
                            `⚠️ Você já possui um ticket: ${existing}`

                    });

                }


                const category =
                    await getTicketCategory(
                        interaction.guild
                    );


                // ==========================================
                // 🛡️ PEGAR CARGOS STAFF
                // ==========================================

                const staffRoles =
                    interaction.guild
                        .roles
                        .cache
                        .filter(

                            role =>
                                STAFF_ROLE_NAMES.includes(
                                    role.name.toLowerCase()
                                )

                        );


                const permissions = [

                    {

                        id:
                            interaction.guild
                                .roles
                                .everyone
                                .id,

                        deny: [

                            PermissionFlagsBits.ViewChannel

                        ]

                    },

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

                    {

                        id:
                            client.user.id,

                        allow: [

                            PermissionFlagsBits.ViewChannel,

                            PermissionFlagsBits.SendMessages,

                            PermissionFlagsBits.ManageChannels,

                            PermissionFlagsBits.ReadMessageHistory

                        ]

                    }

                ];


                staffRoles.forEach(
                    role => {

                        permissions.push({

                            id:
                                role.id,

                            allow: [

                                PermissionFlagsBits.ViewChannel,

                                PermissionFlagsBits.SendMessages,

                                PermissionFlagsBits.ReadMessageHistory,

                                PermissionFlagsBits.AttachFiles

                            ]

                        });

                    }
                );


                const safeName =
                    interaction.user.username

                        .toLowerCase()

                        .replace(
                            /[^a-z0-9]/g,
                            ''
                        )

                        .slice(
                            0,
                            20
                        );


                const ticketChannel =
                    await interaction.guild
                        .channels
                        .create({

                            name:
                                `ticket-${safeName}`,

                            type:
                                ChannelType.GuildText,

                            parent:
                                category.id,

                            topic:
                                `ticket-owner:${interaction.user.id}|type:${type}`,

                            permissionOverwrites:
                                permissions

                        });


                ticketSelections.delete(
                    interaction.user.id
                );


                const typeNames = {

                    support:
                        '🎫 Support',

                    ajuda:
                        '🆘 Ajuda',

                    duvida:
                        '❓ Dúvida'

                };


                const claimButton =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_claim'
                        )

                        .setLabel(
                            'Assumir Ticket'
                        )

                        .setEmoji(
                            '🛡️'
                        )

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

                        .setEmoji(
                            '🔒'
                        )

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
                            0x009DFF
                        )

                        .addTextDisplayComponents(

                            new TextDisplayBuilder()
                                .setContent(
`# 🐺 HUSHPVP • TICKET

## ${typeNames[type] || '🎫 Support'}

👤 **Criado por:** ${interaction.user}

📌 **Assunto:** ${subject}

### 📝 Descrição
${description}

### 📊 Status
🟢 **ABERTO**

Nossa equipe responderá assim que possível.

> 🐺 HushPvP • Support System`
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
                            '❌ Apenas membros da equipe podem assumir tickets.',

                        ephemeral:
                            true

                    });

                }


                return interaction.reply({

                    content:
`# 🛡️ TICKET ASSUMIDO

Este atendimento foi assumido por ${interaction.user}.

👤 Agora aguarde o atendimento da equipe.

> 🐺 HushPvP • Support`

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
                    interaction.user.id !==
                        ownerId &&

                    !isStaff(
                        interaction.member
                    )
                ) {

                    return interaction.reply({

                        content:
                            '❌ Apenas o dono do ticket ou a Staff pode fechar este ticket.',

                        ephemeral:
                            true

                    });

                }


                const confirm =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_close_confirm'
                        )

                        .setLabel(
                            'Confirmar fechamento'
                        )

                        .setEmoji(
                            '✅'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        );


                const cancel =
                    new ButtonBuilder()

                        .setCustomId(
                            'ticket_close_cancel'
                        )

                        .setLabel(
                            'Cancelar'
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        );


                const row =
                    new ActionRowBuilder()

                        .addComponents(
                            confirm,
                            cancel
                        );


                return interaction.reply({

                    content:
                        '🔒 **Tem certeza que deseja fechar este ticket?**',

                    components: [
                        row
                    ],

                    ephemeral:
                        true

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

                    components:
                        []

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
                    interaction.user.id !==
                        ownerId &&

                    !isStaff(
                        interaction.member
                    )
                ) {

                    return interaction.reply({

                        content:
                            '❌ Sem permissão.',

                        ephemeral:
                            true

                    });

                }


                await interaction.update({

                    content:
                        `🔒 Ticket fechado por ${interaction.user}.\n\nEste canal será apagado em **5 segundos**.`,

                    components:
                        []

                });


                setTimeout(
                    async () => {

                        await interaction.channel
                            .delete(
                                `Ticket fechado por ${interaction.user.tag}`
                            )
                            .catch(
                                () => {}
                            );

                    },
                    5000
                );


                return;

            }


// ======================================================
// 📝 RECRUTAMENTO
// ======================================================

            if (
                interaction.isButton() &&
                interaction.customId ===
                'hushpvp_apply'
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

                        ephemeral:
                            true

                    });

                }


                let dm;


                try {

                    dm =
                        await user.createDM();


                    await dm.send(
`# 🐺 RECRUTAMENTO HUSHPVP

Olá ${user}!

Vou fazer algumas perguntas.

Responda uma de cada vez.

Digite **cancelar** para encerrar.

Boa sorte! ⚔️`
                    );

                } catch {

                    return interaction.reply({

                        content:
                            '❌ Ative suas mensagens privadas.',

                        ephemeral:
                            true

                    });

                }


                await interaction.reply({

                    content:
                        '📩 Te enviei uma DM!',

                    ephemeral:
                        true

                });


                applicationsInProgress.add(
                    user.id
                );


                const questions = [

                    '🎮 **1/7 — Qual é seu nick no Minecraft?**',

                    '🎂 **2/7 — Qual é sua idade?**',

                    `🛡️ **3/7 — Qual cargo deseja?**

• Staff
• Admin
• Moderador
• Builder
• Developer`,

                    '📋 **4/7 — Já teve experiência como Staff?**',

                    '⏰ **5/7 — Quanto tempo consegue ficar ativo?**',

                    '🤝 **6/7 — Por que quer entrar na equipe?**',

                    '⭐ **7/7 — Por que devemos escolher você?**'

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
                                    m =>
                                        m.author.id ===
                                        user.id,

                                max:
                                    1,

                                time:
                                    300000,

                                errors:
                                    ['time']

                            });


                        const answer =
                            collected
                                .first()
                                .content
                                .trim();


                        if (
                            [
                                'cancel',
                                'cancelar'
                            ].includes(
                                answer.toLowerCase()
                            )
                        ) {

                            await dm.send(
                                '❌ Candidatura cancelada.'
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
                            '✅ Resposta salva!'
                        );

                    }


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


                    const accept =
                        new ButtonBuilder()

                            .setCustomId(
                                `application_accept_${user.id}`
                            )

                            .setLabel(
                                'Aceitar'
                            )

                            .setEmoji(
                                '✅'
                            )

                            .setStyle(
                                ButtonStyle.Success
                            );


                    const reject =
                        new ButtonBuilder()

                            .setCustomId(
                                `application_reject_${user.id}`
                            )

                            .setLabel(
                                'Rejeitar'
                            )

                            .setEmoji(
                                '❌'
                            )

                            .setStyle(
                                ButtonStyle.Danger
                            );


                    const buttons =
                        new ActionRowBuilder()

                            .addComponents(
                                accept,
                                reject
                            );


                    const container =
                        new ContainerBuilder()

                            .setAccentColor(
                                0x009DFF
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

                                new TextDisplayBuilder()
                                    .setContent(
`# 📋 NOVA CANDIDATURA

👤 ${user}

🎮 **Minecraft:** ${answers[0]}
🎂 **Idade:** ${answers[1]}
🛡️ **Cargo:** ${answers[2]}

## Experiência
${answers[3]}

## Disponibilidade
${answers[4]}

## Por que quer entrar?
${answers[5]}

## Por que devemos escolher você?
${answers[6]}

> 🐺 HushPvP • Recruitment`
                                    )

                            )

                            .addActionRowComponents(
                                buttons
                            );


                    await reviewChannel.send({

                        components: [
                            container
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });


                    await dm.send(
                        '✅ Sua candidatura foi enviada para análise!'
                    );

                } catch {

                    try {

                        await dm.send(
                            '⏰ Candidatura encerrada por tempo.'
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
                            '❌ Apenas Owner/Admin.',

                        ephemeral:
                            true

                    });

                }


                const accepted =
                    interaction.customId
                        .startsWith(
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


                if (
                    !application
                ) {

                    return interaction.reply({

                        content:
                            '❌ Dados não encontrados. O bot pode ter reiniciado.',

                        ephemeral:
                            true

                    });

                }


                const candidate =
                    await client.users.fetch(
                        userId
                    );


                const skinHead =
                    `https://mc-heads.net/avatar/${encodeURIComponent(application.minecraftNick)}/128`;


                const logChannel =
                    await client.channels.fetch(
                        REVIEW_LOG_CHANNEL_ID
                    );


                try {

                    await candidate.send(

                        accepted

                            ? `# 🎉 CANDIDATURA ACEITA!

Sua candidatura para o **HushPvP** foi aceita! ✅

🎮 **Nick:** ${application.minecraftNick}

🛡️ **Cargo:** ${application.position}

Um administrador entrará em contato.

> 🐺 HushPvP`

                            : `# ❌ CANDIDATURA REJEITADA

Obrigado pelo interesse no **HushPvP**.

Sua candidatura não foi aprovada desta vez.

Você poderá tentar novamente futuramente.

> 🐺 HushPvP`

                    );

                } catch {}


                const result =
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

                            new TextDisplayBuilder()
                                .setContent(
`# ${accepted ? '✅ CANDIDATURA ACEITA' : '❌ CANDIDATURA REJEITADA'}

👤 **Candidato:** ${candidate}

🎮 **Minecraft:** ${application.minecraftNick}

🎂 **Idade:** ${application.age}

🛡️ **Cargo:** ${application.position}

👮 **Analisado por:** ${interaction.user}

📋 **Status:** ${accepted ? 'APROVADO' : 'REJEITADO'}

> 🐺 HushPvP • Reviews`
                                )

                        );


                await interaction.update({

                    components: [
                        result
                    ]

                });


                if (
                    logChannel &&
                    logChannel.isTextBased()
                ) {

                    await logChannel.send({

                        components: [
                            result
                        ],

                        flags:
                            MessageFlags.IsComponentsV2

                    });

                }


                applications.delete(
                    userId
                );

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
                        '❌ Ocorreu um erro no sistema.',

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }

        }

    }
);


// ======================================================
// ❌ ERROS
// ======================================================

client.on(
    'error',
    error => {

        console.error(
            '❌ Discord:',
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
