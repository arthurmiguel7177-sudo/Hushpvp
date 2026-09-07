require('dotenv').config();

const express = require('express');

const {
    Client,
    GatewayIntentBits,
    Partials,
    ActivityType,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    AttachmentBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require('discord.js');

const {
    joinVoiceChannel
} = require('@discordjs/voice');


// ======================================================
// ⚙️ CONFIGURAÇÕES DO ASTER
// ======================================================

const GUILD_ID = '1545935454694670378';

// Recrutamento
const RECRUITMENT_CHANNEL_ID = '1545962982385647687';
const APPLICATION_REVIEW_CHANNEL_ID = '1545963991736524840';
const APPLICATION_LOG_CHANNEL_ID = '1545956902826151956';

// Tickets
const TICKET_PANEL_CHANNEL_ID = '1545956394342289478';
const TICKET_SUPPORT_CHANNEL_ID = '1546151207217668166';

// Cores
const ASTER_COLOR = 0x7B2EFF;
const GREEN = 0x57F287;
const RED = 0xED4245;
const YELLOW = 0xFEE75C;


// ======================================================
// 🌐 EXPRESS
// ======================================================

const app = express();

app.get('/', (req, res) => {
    res.send('⭐ Aster Bot está online!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(
        `🌐 Web server online na porta ${process.env.PORT || 3000}`
    );
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
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Moderation
    ],

    partials: [
        Partials.Channel
    ]
});


// ======================================================
// 💾 DADOS TEMPORÁRIOS
// ======================================================

const applicationsInProgress = new Set();
const applications = new Map();


// ======================================================
// 🛡️ PERMISSÃO STAFF
// ======================================================

function hasAdminPermission(member) {

    if (!member) return false;

    if (
        member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    ) {
        return true;
    }

    const allowedRoles = [
        'owner',
        'owners',
        'admin',
        'admins',
        'administrator'
    ];

    return member.roles.cache.some(role =>
        allowedRoles.includes(
            role.name.toLowerCase()
        )
    );
}


// ======================================================
// 🧹 LIMPAR PAINEL ANTIGO DO BOT
// ======================================================

async function deleteOldBotPanels(channel, limit = 20) {

    try {

        const messages =
            await channel.messages.fetch({
                limit
            });

        const botMessages =
            messages.filter(
                message =>
                    message.author.id === client.user.id
            );

        for (const message of botMessages.values()) {

            try {
                await message.delete();
            } catch {}

        }

    } catch (error) {

        console.log(
            'Não consegui limpar painéis antigos:',
            error.message
        );

    }
}


// ======================================================
// 📜 PAINEL DE REGRAS
// ======================================================

async function sendRulesPanel() {

    if (!process.env.CANAL_REGRAS_ID) {
        console.log('⚠️ CANAL_REGRAS_ID não definido.');
        return;
    }

    try {

        const channel =
            await client.channels.fetch(
                process.env.CANAL_REGRAS_ID
            );

        if (!channel || !channel.isTextBased()) {
            return;
        }

        // Apaga somente mensagens do próprio bot.
        await deleteOldBotPanels(channel, 20);

        const banner =
            new AttachmentBuilder(
                './regras.png',
                {
                    name: 'regras.png'
                }
            );

        const container =
            new ContainerBuilder()

                .setAccentColor(
                    ASTER_COLOR
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

• Interfering with staff
• Repeated false reports
• Intentionally avoiding combat
• Disruptive gameplay behavior

# 🚫 PERMANENT BANS

• Cheats or hacks
• Exploiting bugs
• DDoS threats or attacks
• Ban evasion
• Impersonating staff
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

> ⭐ **Aster**
> Play fair • Respect others • Stay competitive ⚔️`
                        )

                );

        await channel.send({
            components: [
                container
            ],

            files: [
                banner
            ],

            flags:
                MessageFlags.IsComponentsV2
        });

        console.log(
            '📜 Painel de regras enviado.'
        );

    } catch (error) {

        console.error(
            '❌ Erro nas regras:',
            error
        );

    }
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

        if (!channel || !channel.isTextBased()) {
            return;
        }

        await deleteOldBotPanels(channel, 20);

        const container =
            new ContainerBuilder()

                .setAccentColor(
                    ASTER_COLOR
                )

                .addTextDisplayComponents(

                    new TextDisplayBuilder()
                        .setContent(
`# 🎫 ASTER SUPPORT

Precisa falar com nossa equipe?

Nosso sistema de atendimento pode ser utilizado para:

### 🛟 Suporte
Problemas relacionados ao **Aster Client** ou ao servidor.

### ❓ Dúvidas
Perguntas sobre o Client, PvP ou comunidade.

### 🐛 Bugs
Encontrou algum problema? Abra um atendimento e explique o ocorrido.

> Clique no botão abaixo para iniciar seu ticket.

⭐ **Aster • Support System**`
                        )

                )

                .addActionRowComponents(

                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    'aster_ticket_create'
                                )
                                .setLabel(
                                    'Iniciar ticket'
                                )
                                .setEmoji('🎫')
                                .setStyle(
                                    ButtonStyle.Primary
                                )

                        )

                );

        await channel.send({
            components: [
                container
            ],

            flags:
                MessageFlags.IsComponentsV2
        });

        console.log(
            '🎫 Painel de ticket enviado.'
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

        const channel =
            await client.channels.fetch(
                RECRUITMENT_CHANNEL_ID
            );

        if (!channel || !channel.isTextBased()) {
            return;
        }

        await deleteOldBotPanels(channel, 20);

        const container =
            new ContainerBuilder()

                .setAccentColor(
                    ASTER_COLOR
                )

                .addTextDisplayComponents(

                    new TextDisplayBuilder()
                        .setContent(
`# 📝 RECRUTAMENTO ASTER

## Processo de Recrutamento — Equipe Aster

Bem-vindo!

Você está prestes a iniciar sua candidatura para fazer parte da equipe do **Aster**.

### 📌 Informações importantes

• Responda todas as perguntas com sinceridade
• Não envie várias candidaturas
• Mantenha suas mensagens privadas ativadas
• Leve o recrutamento a sério
• Não envie senhas ou informações pessoais sensíveis

### ✅ Requisitos básicos

• Boa comunicação
• Respeito com jogadores e staff
• Maturidade
• Atividade no servidor
• Saber trabalhar em equipe
• Compromisso com o Aster

📩 **Clique no botão abaixo para iniciar sua candidatura pela DM.**

> ⭐ Aster • Recrutamento Oficial`
                        )

                )

                .addActionRowComponents(

                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    'aster_apply'
                                )
                                .setLabel(
                                    'Enviar candidatura'
                                )
                                .setEmoji('📝')
                                .setStyle(
                                    ButtonStyle.Primary
                                )

                        )

                );

        await channel.send({
            components: [
                container
            ],

            flags:
                MessageFlags.IsComponentsV2
        });

        console.log(
            '📝 Recrutamento enviado.'
        );

    } catch (error) {

        console.error(
            '❌ Erro no recrutamento:',
            error
        );

    }
}


// ======================================================
// ⚙️ SLASH COMMANDS
// ======================================================

const teamCommand =
    new SlashCommandBuilder()
        .setName('team')
        .setDescription(
            'Mostra a equipe oficial do Aster'
        );


const statusOnCommand =
    new SlashCommandBuilder()
        .setName('statuson')
        .setDescription(
            'Mostra o servidor como ONLINE'
        );


const statusOffCommand =
    new SlashCommandBuilder()
        .setName('statusoff')
        .setDescription(
            'Mostra o servidor como OFFLINE'
        );


const banCommand =
    new SlashCommandBuilder()

        .setName('ban')
        .setDescription(
            'Bane um membro do servidor'
        )

        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription(
                    'Usuário que será banido'
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription(
                    'Motivo do banimento'
                )
                .setRequired(false)
        );


const kickCommand =
    new SlashCommandBuilder()

        .setName('kick')
        .setDescription(
            'Expulsa um membro do servidor'
        )

        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription(
                    'Usuário que será expulso'
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription(
                    'Motivo da expulsão'
                )
                .setRequired(false)
        );


const muteCommand =
    new SlashCommandBuilder()

        .setName('mute')
        .setDescription(
            'Silencia temporariamente um membro'
        )

        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription(
                    'Usuário que será silenciado'
                )
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName('minutos')
                .setDescription(
                    'Tempo do mute em minutos'
                )
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription(
                    'Motivo do mute'
                )
                .setRequired(false)
        );


const unmuteCommand =
    new SlashCommandBuilder()

        .setName('unmute')
        .setDescription(
            'Remove o mute de um membro'
        )

        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription(
                    'Usuário'
                )
                .setRequired(true)
        );


// ======================================================
// 🚀 READY
// ======================================================

client.once('ready', async () => {

    console.log(
        `⭐ ${client.user.tag} ONLINE!`
    );

    // Presença

    client.user.setPresence({
        activities: [
            {
                name: 'Aster ⚔️',
                type:
                    ActivityType.Playing
            }
        ],

        status: 'online'
    });


    // ==================================================
    // ⚙️ REGISTRAR COMANDOS
    // ==================================================

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
            '⚙️ Comandos registrados.'
        );

    } catch (error) {

        console.error(
            '❌ Erro ao registrar comandos:',
            error
        );

    }


    // ==================================================
    // 🔊 ENTRAR NO CANAL DE VOZ
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

                    selfDeaf:
                        true
                });

                console.log(
                    '🔊 Bot conectado na call.'
                );

            }

        } catch (error) {

            console.error(
                '❌ Erro na call:',
                error.message
            );

        }

    }


    // ==================================================
    // 📤 PAINÉIS
    // ==================================================

    await sendRulesPanel();
    await sendTicketPanel();
    await sendRecruitmentPanel();

});


// ======================================================
// ⭐ /TEAM COM TEAM.PNG + COMPONENTS V2
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (
            interaction.commandName !== 'team'
        ) {
            return;
        }

        try {

            await interaction.guild.members.fetch();


            function getMembers(names) {

                const members =
                    new Map();

                interaction.guild.roles.cache

                    .filter(role =>
                        names.includes(
                            role.name
                                .toLowerCase()
                        )
                    )

                    .forEach(role => {

                        role.members.forEach(
                            member => {

                                members.set(
                                    member.id,
                                    member
                                );

                            }
                        );

                    });

                return [
                    ...members.values()
                ];
            }


            const owners =
                getMembers([
                    'owner',
                    'owners'
                ]);


            const admins =
                getMembers([
                    'admin',
                    'admins',
                    'administrator'
                ]);


            const staffs =
                getMembers([
                    'staff',
                    'staffs',
                    'moderador',
                    'moderadores',
                    'moderator',
                    'moderators'
                ]);


            function formatMembers(members) {

                if (!members.length) {
                    return '• Nenhum membro';
                }

                return members
                    .map(
                        member =>
                            `• ${member}`
                    )
                    .join('\n');
            }


            const banner =
                new AttachmentBuilder(
                    './team.png',
                    {
                        name:
                            'team.png'
                    }
                );


            const container =
                new ContainerBuilder()

                    .setAccentColor(
                        ASTER_COLOR
                    )

                    // IMAGEM PRIMEIRO
                    .addMediaGalleryComponents(

                        new MediaGalleryBuilder()
                            .addItems(

                                new MediaGalleryItemBuilder()
                                    .setURL(
                                        'attachment://team.png'
                                    )

                            )

                    )

                    // TEXTO DEPOIS
                    .addTextDisplayComponents(

                        new TextDisplayBuilder()
                            .setContent(
`# ⭐ ASTER TEAM

## 👑 OWNER
${formatMembers(owners)}

## 🛡️ ADMIN
${formatMembers(admins)}

## ⚔️ STAFF
${formatMembers(staffs)}

> ⭐ Aster • Equipe Oficial`
                            )

                    );


            await interaction.reply({

                components: [
                    container
                ],

                files: [
                    banner
                ],

                flags:
                    MessageFlags.IsComponentsV2

            });

        } catch (error) {

            console.error(
                '❌ Erro no /team:',
                error
            );

        }

    }
);


// ======================================================
// 🟢 /STATUSON + 🔴 /STATUSOFF
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (
            interaction.commandName !== 'statuson' &&
            interaction.commandName !== 'statusoff'
        ) {
            return;
        }


        if (
            !hasAdminPermission(
                interaction.member
            )
        ) {

            return interaction.reply({
                content:
                    '❌ Apenas administradores podem usar este comando.',
                ephemeral: true
            });

        }


        const online =
            interaction.commandName ===
            'statuson';


        const container =
            new ContainerBuilder()

                .setAccentColor(
                    online
                        ? GREEN
                        : RED
                )

                .addTextDisplayComponents(

                    new TextDisplayBuilder()
                        .setContent(

online

? `# 🟢 ASTER STATUS

## ✅ SERVIDOR ONLINE

O servidor do **Aster** está ligado e disponível.

🎮 **Status:** \`ONLINE\`

⚡ O servidor está pronto para receber jogadores.

> ⭐ Aster • Server Status`

: `# 🔴 ASTER STATUS

## ❌ SERVIDOR OFFLINE

O servidor do **Aster** está desligado ou indisponível no momento.

🎮 **Status:** \`OFFLINE\`

🔧 Aguarde até o servidor voltar.

> ⭐ Aster • Server Status`

                        )

                );


        await interaction.reply({
            components: [
                container
            ],

            flags:
                MessageFlags.IsComponentsV2
        });

    }
);


// ======================================================
// 🔨 MODERAÇÃO
// /BAN /KICK /MUTE /UNMUTE
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const commands = [
            'ban',
            'kick',
            'mute',
            'unmute'
        ];

        if (
            !commands.includes(
                interaction.commandName
            )
        ) {
            return;
        }


        if (
            !hasAdminPermission(
                interaction.member
            )
        ) {

            return interaction.reply({
                content:
                    '❌ Você não tem permissão para usar esse comando.',
                ephemeral: true
            });

        }


        const user =
            interaction.options.getUser(
                'usuario'
            );

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);


        if (!member) {

            return interaction.reply({
                content:
                    '❌ Não encontrei esse membro no servidor.',
                ephemeral: true
            });

        }


        if (
            member.id ===
            interaction.user.id
        ) {

            return interaction.reply({
                content:
                    '❌ Você não pode aplicar essa punição em você mesmo.',
                ephemeral: true
            });

        }


        const reason =
            interaction.options.getString(
                'motivo'
            ) ||
            'Nenhum motivo informado';


        try {

            // ==========================================
            // 🚫 BAN
            // ==========================================

            if (
                interaction.commandName ===
                'ban'
            ) {

                if (!member.bannable) {

                    return interaction.reply({
                        content:
                            '❌ Não consigo banir esse membro. Verifique a hierarquia dos cargos.',
                        ephemeral: true
                    });

                }


                await member.send(
`# 🚫 VOCÊ FOI BANIDO DO ASTER

**Motivo:** ${reason}

**Staff:** ${interaction.user.tag}

> ⭐ Aster • Moderação`
                ).catch(() => {});


                await member.ban({
                    reason:
                        `${reason} | Staff: ${interaction.user.tag}`
                });


                return interaction.reply(
                    `🚫 ${user} foi banido.\n**Motivo:** ${reason}`
                );

            }


            // ==========================================
            // 👢 KICK
            // ==========================================

            if (
                interaction.commandName ===
                'kick'
            ) {

                if (!member.kickable) {

                    return interaction.reply({
                        content:
                            '❌ Não consigo expulsar esse membro. Verifique a hierarquia dos cargos.',
                        ephemeral: true
                    });

                }


                await member.send(
`# 👢 VOCÊ FOI EXPULSO DO ASTER

**Motivo:** ${reason}

**Staff:** ${interaction.user.tag}

> ⭐ Aster • Moderação`
                ).catch(() => {});


                await member.kick(
                    `${reason} | Staff: ${interaction.user.tag}`
                );


                return interaction.reply(
                    `👢 ${user.tag} foi expulso.\n**Motivo:** ${reason}`
                );

            }


            // ==========================================
            // 🔇 MUTE
            // ==========================================

            if (
                interaction.commandName ===
                'mute'
            ) {

                const minutes =
                    interaction.options
                        .getInteger(
                            'minutos'
                        );


                if (!member.moderatable) {

                    return interaction.reply({
                        content:
                            '❌ Não consigo mutar esse membro. Verifique a hierarquia dos cargos.',
                        ephemeral: true
                    });

                }


                await member.timeout(
                    minutes *
                    60 *
                    1000,

                    `${reason} | Staff: ${interaction.user.tag}`
                );


                await member.send(
`# 🔇 VOCÊ FOI MUTADO NO ASTER

**Tempo:** ${minutes} minuto(s)

**Motivo:** ${reason}

**Staff:** ${interaction.user.tag}

> ⭐ Aster • Moderação`
                ).catch(() => {});


                return interaction.reply(
                    `🔇 ${user} foi mutado por **${minutes} minuto(s)**.\n**Motivo:** ${reason}`
                );

            }


            // ==========================================
            // 🔊 UNMUTE
            // ==========================================

            if (
                interaction.commandName ===
                'unmute'
            ) {

                if (!member.moderatable) {

                    return interaction.reply({
                        content:
                            '❌ Não consigo remover o mute desse membro.',
                        ephemeral: true
                    });

                }


                await member.timeout(
                    null,
                    `Unmute por ${interaction.user.tag}`
                );


                await member.send(
`# 🔊 SEU MUTE FOI REMOVIDO

Seu mute no **Aster** foi removido.

**Staff:** ${interaction.user.tag}

> ⭐ Aster • Moderação`
                ).catch(() => {});


                return interaction.reply(
                    `🔊 O mute de ${user} foi removido.`
                );

            }

        } catch (error) {

            console.error(
                '❌ Erro de moderação:',
                error
            );


            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                await interaction.reply({
                    content:
                        '❌ Ocorreu um erro ao executar a punição.',
                    ephemeral: true
                });

            }

        }

    }
);


// ======================================================
// 🎫 CRIAR TICKET
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) {
            return;
        }

        if (
            interaction.customId !==
            'aster_ticket_create'
        ) {
            return;
        }


        const guild =
            interaction.guild;

        const user =
            interaction.user;


        // Verificar se já existe ticket

        const existing =
            guild.channels.cache.find(
                channel =>
                    channel.topic ===
                    `ASTER-TICKET:${user.id}`
            );


        if (existing) {

            return interaction.reply({
                content:
                    `❌ Você já possui um ticket aberto: ${existing}`,
                ephemeral: true
            });

        }


        try {

            await interaction.deferReply({
                ephemeral: true
            });


            const ticket =
                await guild.channels.create({

                    name:
                        `ticket-${user.username}`
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9-]/g,
                                ''
                            )
                            .slice(0, 80),

                    type:
                        ChannelType.GuildText,

                    topic:
                        `ASTER-TICKET:${user.id}`,

                    parent:
                        TICKET_SUPPORT_CHANNEL_ID,

                    permissionOverwrites: [

                        {
                            id:
                                guild.roles.everyone.id,

                            deny: [
                                PermissionFlagsBits.ViewChannel
                            ]
                        },

                        {
                            id:
                                user.id,

                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }

                    ]

                });


            const container =
                new ContainerBuilder()

                    .setAccentColor(
                        ASTER_COLOR
                    )

                    .addTextDisplayComponents(

                        new TextDisplayBuilder()
                            .setContent(
`# 🎫 TICKET ASTER

Olá ${user}!

Seu atendimento foi criado com sucesso.

Explique detalhadamente sua dúvida ou problema.

### 📌 Informações

• Evite marcar a staff várias vezes
• Explique o problema com detalhes
• Envie imagens se necessário
• Aguarde um membro da equipe

> ⭐ Aster • Support`
                            )

                    )

                    .addActionRowComponents(

                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        `aster_ticket_claim_${user.id}`
                                    )
                                    .setLabel(
                                        'Atender ticket'
                                    )
                                    .setEmoji('🛡️')
                                    .setStyle(
                                        ButtonStyle.Success
                                    ),

                                new ButtonBuilder()
                                    .setCustomId(
                                        `aster_ticket_close_${user.id}`
                                    )
                                    .setLabel(
                                        'Fechar ticket'
                                    )
                                    .setEmoji('🔒')
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )

                            )

                    );


            await ticket.send({
                content:
                    `${user}`,

                components: [
                    container
                ],

                flags:
                    MessageFlags.IsComponentsV2
            });


            await interaction.editReply({
                content:
                    `✅ Seu ticket foi criado: ${ticket}`
            });

        } catch (error) {

            console.error(
                '❌ Erro criando ticket:',
                error
            );


            if (interaction.deferred) {

                await interaction.editReply({
                    content:
                        '❌ Não consegui criar seu ticket.'
                });

            }

        }

    }
);


// ======================================================
// 🛡️ ATENDER / 🔒 FECHAR TICKET
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) {
            return;
        }


        // ==============================================
        // 🛡️ ATENDER
        // ==============================================

        if (
            interaction.customId.startsWith(
                'aster_ticket_claim_'
            )
        ) {

            if (
                !hasAdminPermission(
                    interaction.member
                )
            ) {

                return interaction.reply({
                    content:
                        '❌ Apenas a administração pode atender tickets.',
                    ephemeral: true
                });

            }


            const userId =
                interaction.customId.replace(
                    'aster_ticket_claim_',
                    ''
                );


            const user =
                await client.users.fetch(
                    userId
                ).catch(() => null);


            if (user) {

                await user.send(
`# 🛡️ SEU TICKET ESTÁ SENDO ATENDIDO

Olá ${user}!

Seu ticket no **Aster** começou a ser atendido.

👤 **Staff responsável:** ${interaction.user}

📌 Entre no servidor e acesse seu ticket para continuar o atendimento.

> ⭐ Aster • Support`
                ).catch(() => {});

            }


            return interaction.reply({
                content:
                    `🛡️ ${interaction.user} assumiu este atendimento.`
            });

        }


        // ==============================================
        // 🔒 FECHAR
        // ==============================================

        if (
            interaction.customId.startsWith(
                'aster_ticket_close_'
            )
        ) {

            const userId =
                interaction.customId.replace(
                    'aster_ticket_close_',
                    ''
                );


            const canClose =
                interaction.user.id === userId ||
                hasAdminPermission(
                    interaction.member
                );


            if (!canClose) {

                return interaction.reply({
                    content:
                        '❌ Você não pode fechar este ticket.',
                    ephemeral: true
                });

            }


            await interaction.reply({
                content:
                    '🔒 Ticket será fechado em **5 segundos**...'
            });


            const user =
                await client.users.fetch(
                    userId
                ).catch(() => null);


            if (user) {

                await user.send(
`# 🔒 TICKET FINALIZADO

Seu atendimento no **Aster** foi encerrado.

Obrigado por entrar em contato com nossa equipe.

> ⭐ Aster • Support`
                ).catch(() => {});

            }


            setTimeout(async () => {

                try {
                    await interaction.channel.delete();
                } catch {}

            }, 5000);

        }

    }
);


// ======================================================
// 📝 INICIAR CANDIDATURA
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) {
            return;
        }

        if (
            interaction.customId !==
            'aster_apply'
        ) {
            return;
        }


        const user =
            interaction.user;


        if (
            applicationsInProgress.has(
                user.id
            )
        ) {

            return interaction.reply({
                content:
                    '❌ Você já está preenchendo uma candidatura.',
                ephemeral: true
            });

        }


        applicationsInProgress.add(
            user.id
        );


        await interaction.reply({
            content:
                '📩 Enviei as perguntas na sua DM!',
            ephemeral: true
        });


        try {

            const dm =
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


            const questions = [

                '🎮 **1/7 — Qual é o seu nick no Minecraft?**',

                '🎂 **2/7 — Qual é a sua idade?**',

`🛡️ **3/7 — Para qual cargo você está se candidatando?**

• Staff
• Admin
• Moderador
• Builder
• Developer`,

`📋 **4/7 — Você já teve experiência como staff anteriormente?**

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
                            5 *
                            60 *
                            1000,

                        errors: [
                            'time'
                        ]

                    });


                const answer =
                    collected.first()
                        .content
                        .trim();


                if (
                    answer.toLowerCase() ===
                        'cancelar' ||
                    answer.toLowerCase() ===
                        'cancel'
                ) {

                    applicationsInProgress
                        .delete(
                            user.id
                        );


                    await dm.send(
                        '❌ Sua candidatura foi cancelada.'
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


            const data = {

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

            };


            applications.set(
                user.id,
                data
            );


            applicationsInProgress
                .delete(
                    user.id
                );


            await dm.send(
`# ✅ CANDIDATURA ENVIADA

Sua candidatura foi enviada para a administração do **Aster**.

Agora aguarde a análise da equipe.

Você receberá o resultado pela DM.

> ⭐ Aster • Recrutamento`
            );


            // ==========================================
            // 📋 ENVIAR PARA REVIEW
            // ==========================================

            const reviewChannel =
                await client.channels.fetch(
                    APPLICATION_REVIEW_CHANNEL_ID
                );


            const skinUrl =
                `https://mc-heads.net/avatar/${encodeURIComponent(
                    data.minecraftNick
                )}/128`;


            const container =
                new ContainerBuilder()

                    .setAccentColor(
                        ASTER_COLOR
                    )

                    .addMediaGalleryComponents(

                        new MediaGalleryBuilder()
                            .addItems(

                                new MediaGalleryItemBuilder()
                                    .setURL(
                                        skinUrl
                                    )

                            )

                    )

                    .addTextDisplayComponents(

                        new TextDisplayBuilder()
                            .setContent(
`# 📋 NOVA CANDIDATURA

## 👤 Candidato
${user}

**Discord:** ${user.tag}
**ID:** \`${user.id}\`

## 🎮 Nick no Minecraft
${data.minecraftNick}

## 🎂 Idade
${data.age}

## 🛡️ Cargo desejado
${data.position}

## 📋 Experiência anterior
${data.experience}

## ⏰ Disponibilidade
${data.availability}

## 🤝 Por que quer entrar no Aster?
${data.reason}

## ⭐ Por que devemos escolher você?
${data.whyChoose}

> ⭐ Aster • Sistema de Recrutamento`
                            )

                    )

                    .addActionRowComponents(

                        new ActionRowBuilder()
                            .addComponents(

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
                                    ),

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
                                    )

                            )

                    );


            await reviewChannel.send({
                components: [
                    container
                ],

                flags:
                    MessageFlags.IsComponentsV2
            });

        } catch (error) {

            applicationsInProgress
                .delete(
                    user.id
                );


            console.error(
                '❌ Recrutamento:',
                error
            );


            await user.send(
                '❌ O processo foi encerrado. Verifique se suas DMs estão abertas e tente novamente.'
            ).catch(() => {});

        }

    }
);


// ======================================================
// ✅ ACEITAR / ❌ REJEITAR CANDIDATURA
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) {
            return;
        }


        const accepted =
            interaction.customId.startsWith(
                'application_accept_'
            );


        const rejected =
            interaction.customId.startsWith(
                'application_reject_'
            );


        if (
            !accepted &&
            !rejected
        ) {
            return;
        }


        if (
            !hasAdminPermission(
                interaction.member
            )
        ) {

            return interaction.reply({
                content:
                    '❌ Apenas Owner/Admin pode analisar candidaturas.',
                ephemeral: true
            });

        }


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


        const data =
            applications.get(
                userId
            );


        if (!data) {

            return interaction.reply({
                content:
                    '❌ Não encontrei os dados dessa candidatura. Talvez o bot tenha reiniciado.',
                ephemeral: true
            });

        }


        const candidate =
            await client.users.fetch(
                userId
            ).catch(() => null);


        if (!candidate) {

            return interaction.reply({
                content:
                    '❌ Não encontrei o candidato.',
                ephemeral: true
            });

        }


        const result =
            accepted
                ? 'APROVADO'
                : 'REJEITADO';


        const resultEmoji =
            accepted
                ? '✅'
                : '❌';


        const resultColor =
            accepted
                ? GREEN
                : RED;


        // ==============================================
        // 📩 DM DO CANDIDATO
        // ==============================================

        if (accepted) {

            await candidate.send(
`# 🎉 CANDIDATURA ACEITA!

Parabéns ${candidate}!

Sua candidatura para entrar na equipe do **Aster** foi **ACEITA**. ✅

🎮 **Nick:** ${data.minecraftNick}

🛡️ **Cargo:** ${data.position}

Um administrador entrará em contato com você.

Bem-vindo à equipe! ⭐⚔️

> Aster • Recrutamento`
            ).catch(() => {});

        } else {

            await candidate.send(
`# ❌ RESULTADO DA CANDIDATURA

Olá ${candidate}.

Obrigado pelo interesse em fazer parte da equipe do **Aster**.

Após analisarmos sua candidatura, infelizmente ela **não foi aprovada desta vez**.

🎮 **Nick:** ${data.minecraftNick}

🛡️ **Cargo:** ${data.position}

Você poderá tentar novamente em outra oportunidade.

> ⭐ Aster • Recrutamento`
            ).catch(() => {});

        }


        // ==============================================
        // 🖼️ RESULTADO NO REVIEW
        // ==============================================

        const skinUrl =
            `https://mc-heads.net/avatar/${encodeURIComponent(
                data.minecraftNick
            )}/128`;


        const resultContainer =
            new ContainerBuilder()

                .setAccentColor(
                    resultColor
                )

                .addMediaGalleryComponents(

                    new MediaGalleryBuilder()
                        .addItems(

                            new MediaGalleryItemBuilder()
                                .setURL(
                                    skinUrl
                                )

                        )

                )

                .addTextDisplayComponents(

                    new TextDisplayBuilder()
                        .setContent(
`# ${resultEmoji} CANDIDATURA ${result}

👤 **Candidato:** ${candidate}

🎮 **Minecraft:** ${data.minecraftNick}

🛡️ **Cargo:** ${data.position}

👮 **Analisado por:** ${interaction.user}

> ⭐ Aster • Recrutamento`
                        )

                );


        await interaction.update({
            components: [
                resultContainer
            ]
        });


        // ==============================================
        // 📋 LOG FINAL
        // ==============================================

        try {

            const logChannel =
                await client.channels.fetch(
                    APPLICATION_LOG_CHANNEL_ID
                );


            const logContainer =
                new ContainerBuilder()

                    .setAccentColor(
                        resultColor
                    )

                    .addMediaGalleryComponents(

                        new MediaGalleryBuilder()
                            .addItems(

                                new MediaGalleryItemBuilder()
                                    .setURL(
                                        skinUrl
                                    )

                            )

                    )

                    .addTextDisplayComponents(

                        new TextDisplayBuilder()
                            .setContent(
`# ${resultEmoji} RESULTADO DO RECRUTAMENTO

👤 **Candidato:** ${candidate}

🎮 **Minecraft:** ${data.minecraftNick}

🎂 **Idade:** ${data.age}

🛡️ **Cargo:** ${data.position}

👮 **Administrador:** ${interaction.user}

📋 **Resultado:** **${result}**

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

        } catch (error) {

            console.error(
                '❌ Erro no log:',
                error
            );

        }


        applications.delete(
            userId
        );

    }
);


// ======================================================
// ❌ ERROS
// ======================================================

client.on(
    'error',
    error => {

        console.error(
            '❌ Discord Client Error:',
            error
        );

    }
);


process.on(
    'unhandledRejection',
    error => {

        console.error(
            '❌ Unhandled Rejection:',
            error
        );

    }
);


// ======================================================
// 🔑 LOGIN
// ======================================================

client.login(
    process.env.DISCORD_TOKEN
);
