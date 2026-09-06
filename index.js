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
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Partials
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');


// ======================================================
// ⚙️ CONFIGURAÇÕES
// ======================================================

const GUILD_ID = '1545935454694670378';

const RECRUITMENT_CHANNEL_ID =
    '1545962982385647687';

const APPLICATION_REVIEW_CHANNEL_ID =
    '1545963991736524840';

const REVIEW_LOG_CHANNEL_ID =
    '1545956902826151956';


// Jogadores respondendo formulário
const applicationsInProgress = new Set();


// Candidaturas aguardando análise
const applications = new Map();


// ======================================================
// 🌐 EXPRESS
// ======================================================

const app = express();

const PORT =
    process.env.PORT || 3000;


app.get('/', (req, res) => {

    res.send(
        '🐺 HushPvP Bot está online!'
    );

});


app.listen(PORT, () => {

    console.log(
        `🌐 Servidor web rodando na porta ${PORT}`
    );

});


// ======================================================
// 🤖 CLIENT DISCORD
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
// ⚔️ COMANDO /TEAM
// ======================================================

const teamCommand =
    new SlashCommandBuilder()

        .setName('team')

        .setDescription(
            'Mostra a equipe oficial do HushPvP'
        );


// ======================================================
// 📝 PAINEL DE RECRUTAMENTO
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
        ) {

            console.log(
                '❌ Canal de recrutamento inválido.'
            );

            return;
        }


        // ==============================================
        // 🧹 APAGAR PAINEL ANTIGO DO BOT
        // ==============================================

        try {

            const messages =
                await channel.messages.fetch({
                    limit: 20
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

        const applyButton =
            new ButtonBuilder()

                .setCustomId(
                    'hushpvp_apply'
                )

                .setLabel(
                    'Enviar candidatura'
                )

                .setEmoji('📝')

                .setStyle(
                    ButtonStyle.Primary
                );


        const row =
            new ActionRowBuilder()

                .addComponents(
                    applyButton
                );


        // ==============================================
        // 📦 PAINEL
        // ==============================================

        const container =
            new ContainerBuilder()

                .setAccentColor(
                    0x009DFF
                )

                .addTextDisplayComponents(

                    new TextDisplayBuilder()
                        .setContent(
`# 📝 RECRUTAMENTO HUSHPVP

## Processo de Recrutamento — Equipe HushPvP

Bem-vindo!

Você está prestes a iniciar sua candidatura para fazer parte da equipe do **HushPvP**.

### 📌 Informações importantes

• Responda todas as perguntas com sinceridade
• Não envie várias candidaturas
• Mantenha suas mensagens privadas ativadas
• Leve o recrutamento a sério
• Não envie senhas ou informações pessoais

### ✅ Requisitos básicos

• Boa comunicação
• Respeito com jogadores e staff
• Maturidade
• Atividade no servidor
• Saber trabalhar em equipe
• Compromisso com o HushPvP

📩 **Clique no botão abaixo para iniciar sua candidatura pela DM.**

> 🐺 HushPvP • Recrutamento Oficial`
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
            '✅ Painel de recrutamento enviado!'
        );


    } catch (error) {

        console.error(
            '❌ Erro no painel de recrutamento:',
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
            `🐺 HushPvP online como ${client.user.tag}`
        );

        console.log(
            '======================================'
        );


        // ==============================================
        // 🎮 STATUS
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
        // ⚔️ REGISTRAR /TEAM
        // ==============================================

        try {

            const guild =
                await client.guilds.fetch(
                    GUILD_ID
                );


            await guild.commands.set([

                teamCommand.toJSON()

            ]);


            console.log(
                '✅ /team registrado!'
            );


        } catch (error) {

            console.error(
                '❌ Erro ao registrar /team:',
                error
            );

        }


        // ==============================================
        // 🔊 ENTRAR NO CANAL DE VOZ
        // ==============================================

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
                            true,

                        selfMute:
                            false

                    });


                    console.log(
                        `🔊 Conectado em ${voiceChannel.name}`
                    );

                }

            } catch (error) {

                console.error(
                    '❌ Erro no canal de voz:',
                    error
                );

            }

        }


        // ==============================================
        // 📜 PAINEL DE REGRAS
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


                    // Apaga mensagens antigas
                    try {

                        const messages =
                            await rulesChannel
                                .messages
                                .fetch({
                                    limit: 100
                                });


                        if (
                            messages.size > 0
                        ) {

                            await rulesChannel
                                .bulkDelete(
                                    messages,
                                    true
                                );

                        }

                    } catch {}


                    const banner =
                        new AttachmentBuilder(
                            './regras.png',
                            {
                                name:
                                    'regras.png'
                            }
                        );


                    const rulesContainer =
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

                        flags:
                            MessageFlags
                                .IsComponentsV2

                    });


                    console.log(
                        '✅ Regras enviadas!'
                    );

                }

            } catch (error) {

                console.error(
                    '❌ Erro nas regras:',
                    error
                );

            }

        }


        // ==============================================
        // 📝 PAINEL DE RECRUTAMENTO
        // ==============================================

        await sendRecruitmentPanel();

    }
);


// ======================================================
// ⚔️ /TEAM
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction
                .isChatInputCommand()
        ) return;


        if (
            interaction.commandName !==
            'team'
        ) return;


        try {

            await interaction
                .guild
                .members
                .fetch();


            const ownerRole =
                interaction
                    .guild
                    .roles
                    .cache
                    .find(

                        role =>
                            [
                                'owner',
                                'owners'
                            ].includes(
                                role.name
                                    .toLowerCase()
                            )

                    );


            const adminRole =
                interaction
                    .guild
                    .roles
                    .cache
                    .find(

                        role =>
                            [
                                'admin',
                                'admins',
                                'administrator'
                            ].includes(
                                role.name
                                    .toLowerCase()
                            )

                    );


            const staffRole =
                interaction
                    .guild
                    .roles
                    .cache
                    .find(

                        role =>
                            [
                                'staff',
                                'staffs'
                            ].includes(
                                role.name
                                    .toLowerCase()
                            )

                    );


            const owners =
                ownerRole
                    ? ownerRole
                        .members
                        .map(
                            member =>
                                `• ${member}`
                        )
                    : [];


            const admins =
                adminRole
                    ? adminRole
                        .members
                        .map(
                            member =>
                                `• ${member}`
                        )
                    : [];


            const staffs =
                staffRole
                    ? staffRole
                        .members
                        .map(
                            member =>
                                `• ${member}`
                        )
                    : [];


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
${owners.length ? owners.join('\n') : '• Nenhum membro'}

# 🛡️ ADMIN
${admins.length ? admins.join('\n') : '• Nenhum membro'}

# ⚔️ STAFF
${staffs.length ? staffs.join('\n') : '• Nenhum membro'}

> 💙 HushPvP • Equipe Oficial`
                            )

                    );


            await interaction.reply({

                components: [
                    container
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
// 📝 BOTÃO DE RECRUTAMENTO
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction.isButton()
        ) return;


        if (
            interaction.customId !==
            'hushpvp_apply'
        ) return;


        const user =
            interaction.user;


        // ==============================================
        // 🚫 JÁ ESTÁ RESPONDENDO
        // ==============================================

        if (
            applicationsInProgress
                .has(user.id)
        ) {

            await interaction.reply({

                content:
                    '⚠️ Você já possui uma candidatura em andamento na sua DM.',

                ephemeral:
                    true

            });

            return;
        }


        // ==============================================
        // 📩 CRIAR DM
        // ==============================================

        let dm;


        try {

            dm =
                await user.createDM();


            await dm.send(
`# 🐺 RECRUTAMENTO HUSHPVP

Olá ${user}!

Bem-vindo ao processo de recrutamento da equipe **HushPvP**.

Vou fazer algumas perguntas para você.

Responda uma por uma com calma e sinceridade.

> Digite **cancelar** a qualquer momento para encerrar sua candidatura.

Boa sorte! ⚔️`
            );


        } catch {

            await interaction.reply({

                content:
                    '❌ Não consegui enviar uma DM para você. Ative suas mensagens privadas e tente novamente.',

                ephemeral:
                    true

            });

            return;

        }


        await interaction.reply({

            content:
                '📩 Te enviei uma DM! Continue sua candidatura no privado.',

            ephemeral:
                true

        });


        applicationsInProgress.add(
            user.id
        );


        // ==============================================
        // ❓ PERGUNTAS
        // ==============================================

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

            `⏰ **5/7 — Quanto tempo você consegue ficar ativo no HushPvP?**

Exemplos:
• 2 horas por dia
• 4 horas por dia
• Apenas finais de semana`,

            '🤝 **6/7 — Por que você quer entrar para a equipe do HushPvP?**',

            '⭐ **7/7 — Por que deveríamos escolher você para fazer parte da equipe?**'

        ];


        const answers = [];


        try {

            for (
                let i = 0;
                i < questions.length;
                i++
            ) {

                await dm.send(
                    questions[i]
                );


                const collected =
                    await dm.awaitMessages({

                        filter:
                            message =>
                                message
                                    .author
                                    .id ===
                                user.id,

                        max:
                            1,

                        time:
                            5 *
                            60 *
                            1000,

                        errors:
                            ['time']

                    });


                const answer =
                    collected
                        .first()
                        .content
                        .trim();


                // ==========================================
                // ❌ CANCELAR
                // ==========================================

                if (
                    answer
                        .toLowerCase() ===
                        'cancel' ||

                    answer
                        .toLowerCase() ===
                        'cancelar'
                ) {

                    await dm.send(
`# ❌ CANDIDATURA CANCELADA

Sua candidatura foi cancelada.

Você poderá tentar novamente quando quiser.

> 🐺 HushPvP • Recrutamento`
                    );


                    applicationsInProgress
                        .delete(
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


            // ==============================================
            // 💾 SALVAR CANDIDATURA
            // ==============================================

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


            const minecraftNick =
                answers[0];


            const skinHead =
                `https://mc-heads.net/avatar/${encodeURIComponent(minecraftNick)}/128`;


            // ==============================================
            // 📤 CANAL DE ANÁLISE
            // ==============================================

            const reviewChannel =
                await client.channels.fetch(
                    APPLICATION_REVIEW_CHANNEL_ID
                );


            if (
                !reviewChannel ||
                !reviewChannel.isTextBased()
            ) {

                throw new Error(
                    'Canal de análise inválido.'
                );

            }


            // ==============================================
            // 🔘 BOTÕES
            // ==============================================

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


            // ==============================================
            // 📋 PAINEL DA CANDIDATURA
            // ==============================================

            const applicationContainer =
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

## 👤 Candidato
${user}

**Discord:** ${user.tag}

**ID:** \`${user.id}\`

## 🎮 Nick no Minecraft
${answers[0]}

## 🎂 Idade
${answers[1]}

## 🛡️ Cargo desejado
${answers[2]}

## 📋 Experiência anterior
${answers[3]}

## ⏰ Disponibilidade
${answers[4]}

## 🤝 Por que quer entrar no HushPvP?
${answers[5]}

## ⭐ Por que devemos escolher você?
${answers[6]}

> 🐺 HushPvP • Sistema de Recrutamento`
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
                    MessageFlags
                        .IsComponentsV2

            });


            // ==============================================
            // ✅ CONFIRMAÇÃO NA DM
            // ==============================================

            await dm.send(
`# ✅ CANDIDATURA ENVIADA

Sua candidatura foi enviada com sucesso para a equipe do **HushPvP**.

Agora aguarde a análise dos administradores.

Você receberá o resultado aqui mesmo pela sua DM.

> 🐺 HushPvP • Recrutamento`
            );


        } catch (error) {

            console.error(
                '❌ Erro no recrutamento:',
                error
            );


            try {

                await dm.send(
`# ⏰ CANDIDATURA ENCERRADA

Você demorou muito para responder ou ocorreu um erro durante o recrutamento.

Você poderá iniciar uma nova candidatura quando estiver pronto.

> 🐺 HushPvP • Recrutamento`
                );

            } catch {}

        }


        applicationsInProgress
            .delete(
                user.id
            );

    }
);


// ======================================================
// ✅ ACEITAR / ❌ REJEITAR
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction.isButton()
        ) return;


        const isAccept =
            interaction
                .customId
                .startsWith(
                    'application_accept_'
                );


        const isReject =
            interaction
                .customId
                .startsWith(
                    'application_reject_'
                );


        if (
            !isAccept &&
            !isReject
        ) return;


        // ==============================================
        // 🛡️ PERMISSÃO
        // ==============================================

        const allowedRoles = [

            'owner',
            'owners',
            'admin',
            'admins',
            'administrator'

        ];


        const hasPermission =
            interaction
                .member
                .roles
                .cache
                .some(

                    role =>
                        allowedRoles
                            .includes(
                                role
                                    .name
                                    .toLowerCase()
                            )

                );


        if (
            !hasPermission
        ) {

            await interaction.reply({

                content:
                    '❌ Apenas Owner ou Admin pode analisar candidaturas.',

                ephemeral:
                    true

            });


            return;

        }


        // ==============================================
        // 👤 ID CANDIDATO
        // ==============================================

        const userId =
            interaction
                .customId

                .replace(
                    'application_accept_',
                    ''
                )

                .replace(
                    'application_reject_',
                    ''
                );


        try {

            const candidate =
                await client.users.fetch(
                    userId
                );


            const application =
                applications.get(
                    userId
                );


            if (
                !application
            ) {

                await interaction.reply({

                    content:
                        '❌ Não encontrei os dados dessa candidatura. Talvez o bot tenha reiniciado desde que ela foi enviada.',

                    ephemeral:
                        true

                });


                return;

            }


            const minecraftNick =
                application
                    .minecraftNick;


            const skinHead =
                `https://mc-heads.net/avatar/${encodeURIComponent(minecraftNick)}/128`;


            // ==============================================
            // 📢 CANAL DE REVIEWS
            // ==============================================

            const reviewLogChannel =
                await client.channels.fetch(
                    REVIEW_LOG_CHANNEL_ID
                );


            // ==================================================
            // ✅ ACEITAR
            // ==================================================

            if (
                isAccept
            ) {


                // ==========================================
                // 📩 DM DO CANDIDATO
                // ==========================================

                try {

                    await candidate.send(
`# 🎉 CANDIDATURA ACEITA!

Parabéns ${candidate}!

Sua candidatura para entrar na equipe do **HushPvP** foi **ACEITA**. ✅

🎮 **Nick no Minecraft:** ${minecraftNick}

🛡️ **Cargo solicitado:** ${application.position}

Um administrador entrará em contato com você para informar os próximos passos.

Bem-vindo à equipe! 🐺⚔️

> HushPvP • Recrutamento`
                    );

                } catch {}


                // ==========================================
                // ✅ ATUALIZA A CANDIDATURA
                // ==========================================

                const acceptedContainer =
                    new ContainerBuilder()

                        .setAccentColor(
                            0x00FF7F
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
`# ✅ CANDIDATURA ACEITA

👤 **Candidato:** ${candidate}

🎮 **Minecraft:** ${minecraftNick}

🛡️ **Cargo:** ${application.position}

👮 **Aceito por:** ${interaction.user}

## 🎉 RESULTADO
**ACEITO**

> 🐺 HushPvP • Recrutamento`
                                )

                        );


                await interaction.update({

                    components: [
                        acceptedContainer
                    ]

                });


                // ==========================================
                // ⭐ LOG NO CANAL DE REVIEWS
                // ==========================================

                if (
                    reviewLogChannel &&
                    reviewLogChannel
                        .isTextBased()
                ) {

                    const reviewContainer =
                        new ContainerBuilder()

                            .setAccentColor(
                                0x00FF7F
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
`# ✅ CANDIDATURA ACEITA

👤 **Discord:** ${candidate}

🎮 **Minecraft:** ${minecraftNick}

🛡️ **Cargo:** ${application.position}

🎂 **Idade:** ${application.age}

👮 **Aceito por:** ${interaction.user}

📋 **Status:** APROVADO

> 🐺 HushPvP • Reviews`
                                    )

                            );


                    await reviewLogChannel.send({

                        components: [
                            reviewContainer
                        ],

                        flags:
                            MessageFlags
                                .IsComponentsV2

                    });

                }


                console.log(
                    `✅ ${candidate.tag} foi aceito por ${interaction.user.tag}`
                );

            }


            // ==================================================
            // ❌ REJEITAR
            // ==================================================

            if (
                isReject
            ) {


                // ==========================================
                // 📩 DM
                // ==========================================

                try {

                    await candidate.send(
`# ❌ RESULTADO DA CANDIDATURA

Olá ${candidate}.

Obrigado pelo interesse em fazer parte da equipe do **HushPvP**.

Após analisarmos sua candidatura, infelizmente ela **não foi aprovada desta vez**.

🎮 **Nick no Minecraft:** ${minecraftNick}

🛡️ **Cargo solicitado:** ${application.position}

Você poderá tentar novamente em outra oportunidade.

> 🐺 HushPvP • Recrutamento`
                    );

                } catch {}


                // ==========================================
                // ❌ ATUALIZAR PAINEL
                // ==========================================

                const rejectedContainer =
                    new ContainerBuilder()

                        .setAccentColor(
                            0xFF0000
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
`# ❌ CANDIDATURA REJEITADA

👤 **Candidato:** ${candidate}

🎮 **Minecraft:** ${minecraftNick}

🛡️ **Cargo:** ${application.position}

👮 **Rejeitado por:** ${interaction.user}

## RESULTADO
**REJEITADO**

> 🐺 HushPvP • Recrutamento`
                                )

                        );


                await interaction.update({

                    components: [
                        rejectedContainer
                    ]

                });


                // ==========================================
                // ⭐ REVIEW LOG
                // ==========================================

                if (
                    reviewLogChannel &&
                    reviewLogChannel
                        .isTextBased()
                ) {

                    const reviewContainer =
                        new ContainerBuilder()

                            .setAccentColor(
                                0xFF0000
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
`# ❌ CANDIDATURA REJEITADA

👤 **Discord:** ${candidate}

🎮 **Minecraft:** ${minecraftNick}

🛡️ **Cargo:** ${application.position}

🎂 **Idade:** ${application.age}

👮 **Rejeitado por:** ${interaction.user}

📋 **Status:** REJEITADO

> 🐺 HushPvP • Reviews`
                                    )

                            );


                    await reviewLogChannel.send({

                        components: [
                            reviewContainer
                        ],

                        flags:
                            MessageFlags
                                .IsComponentsV2

                    });

                }


                console.log(
                    `❌ ${candidate.tag} foi rejeitado por ${interaction.user.tag}`
                );

            }


            // ==============================================
            // 🧹 REMOVER DA MEMÓRIA
            // ==============================================

            applications.delete(
                userId
            );


        } catch (error) {

            console.error(
                '❌ Erro ao analisar candidatura:',
                error
            );

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
            '❌ Erro do Discord:',
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
