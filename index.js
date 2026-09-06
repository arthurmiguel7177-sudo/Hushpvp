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
    ActionRowBuilder
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

const applicationsInProgress = new Set();


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
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});


// ======================================================
// ⚔️ COMANDO /TEAM
// ======================================================

const teamCommand = new SlashCommandBuilder()
    .setName('team')
    .setDescription('Mostra a equipe oficial do HushPvP');


// ======================================================
// 📝 PAINEL DE RECRUTAMENTO
// ======================================================

async function sendRecruitmentPanel() {

    try {

        const channel = await client.channels.fetch(
            RECRUITMENT_CHANNEL_ID
        );

        if (!channel || !channel.isTextBased()) {
            console.log('❌ Canal de recrutamento inválido.');
            return;
        }


        // APAGAR PAINEL ANTIGO DO BOT
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


        // BOTÃO
        const applyButton = new ButtonBuilder()
            .setCustomId('hushpvp_apply')
            .setLabel('Enviar candidatura')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary);


        const row = new ActionRowBuilder()
            .addComponents(applyButton);


        // PAINEL
        const recruitmentContainer = new ContainerBuilder()

            .setAccentColor(0x009DFF)

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
`# 📝 RECRUTAMENTO HUSHPVP

## Processo de Recrutamento — Equipe HushPvP

Bem-vindo!

Você está prestes a iniciar sua candidatura para entrar na equipe do **HushPvP**.

Leia as informações abaixo antes de continuar.

### 📌 Informações Importantes

• Responda todas as perguntas com sinceridade
• Não envie várias candidaturas
• Mantenha suas mensagens privadas ativadas
• Leve o recrutamento a sério
• Nunca envie senhas ou informações pessoais sensíveis

### ✅ Requisitos Básicos

• Ter boa comunicação
• Saber respeitar jogadores e membros da equipe
• Ter maturidade
• Ser ativo na comunidade
• Saber trabalhar em equipe
• Ter compromisso com o HushPvP

📩 **Clique no botão abaixo para iniciar sua candidatura pela DM.**

> 🐺 HushPvP • Recrutamento Oficial`
                    )
            )

            .addActionRowComponents(row);


        await channel.send({
            components: [recruitmentContainer],
            flags: MessageFlags.IsComponentsV2
        });


        console.log('✅ Painel de recrutamento enviado!');


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
    // ⚔️ REGISTRAR /TEAM
    // ==================================================

    try {

        const guild = await client.guilds.fetch(
            GUILD_ID
        );

        await guild.commands.set([
            teamCommand.toJSON()
        ]);

        console.log('✅ /team registrado!');

    } catch (error) {

        console.error(
            '❌ Erro ao registrar /team:',
            error
        );

    }


    // ==================================================
    // 🔊 CANAL DE VOZ
    // ==================================================

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
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator:
                    voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            console.log(
                `🔊 Conectado em ${voiceChannel.name}`
            );

        } else {

            console.log(
                '❌ Canal de voz inválido.'
            );

        }

    } catch (error) {

        console.error(
            '❌ Erro no canal de voz:',
            error
        );

    }


    // ==================================================
    // 📜 PAINEL DE REGRAS
    // ==================================================

    try {

        const rulesChannel =
            await client.channels.fetch(
                process.env.CANAL_REGRAS_ID
            );

        if (
            rulesChannel &&
            rulesChannel.isTextBased()
        ) {

            try {

                const messages =
                    await rulesChannel.messages.fetch({
                        limit: 100
                    });

                if (messages.size > 0) {

                    await rulesChannel.bulkDelete(
                        messages,
                        true
                    );

                }

            } catch {}


            const banner =
                new AttachmentBuilder(
                    './regras.png',
                    {
                        name: 'regras.png'
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
                components: [rulesContainer],
                files: [banner],
                flags:
                    MessageFlags.IsComponentsV2
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


    // ==================================================
    // 📝 RECRUTAMENTO
    // ==================================================

    await sendRecruitmentPanel();

});


// ======================================================
// ⚔️ /TEAM
// ======================================================

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== 'team') return;


    try {

        await interaction.guild.members.fetch();


        const ownerRole =
            interaction.guild.roles.cache.find(
                role =>
                    [
                        'owner',
                        'owners'
                    ].includes(
                        role.name.toLowerCase()
                    )
            );


        const adminRole =
            interaction.guild.roles.cache.find(
                role =>
                    [
                        'admin',
                        'admins',
                        'administrator'
                    ].includes(
                        role.name.toLowerCase()
                    )
            );


        const staffRole =
            interaction.guild.roles.cache.find(
                role =>
                    [
                        'staff',
                        'staffs'
                    ].includes(
                        role.name.toLowerCase()
                    )
            );


        const owners =
            ownerRole
                ? ownerRole.members.map(
                    member => `• ${member}`
                )
                : [];


        const admins =
            adminRole
                ? adminRole.members.map(
                    member => `• ${member}`
                )
                : [];


        const staffs =
            staffRole
                ? staffRole.members.map(
                    member => `• ${member}`
                )
                : [];


        const teamContainer =
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
                teamContainer
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

});


// ======================================================
// 📝 BOTÃO DE RECRUTAMENTO
// ======================================================

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;

    if (
        interaction.customId !==
        'hushpvp_apply'
    ) return;


    const user =
        interaction.user;


    // ==================================================
    // 🚫 EVITAR DUPLICIDADE
    // ==================================================

    if (
        applicationsInProgress.has(
            user.id
        )
    ) {

        await interaction.reply({
            content:
                '⚠️ Você já possui uma candidatura em andamento na sua DM.',
            ephemeral:
                true
        });

        return;
    }


    let dm;


    // ==================================================
    // 📩 ABRIR DM
    // ==================================================

    try {

        dm =
            await user.createDM();

        await dm.send(
`# 🐺 RECRUTAMENTO HUSHPVP

Olá ${user}!

Bem-vindo ao processo de recrutamento da equipe **HushPvP**.

Vou fazer algumas perguntas para você.

Responda uma por uma com calma e sinceridade.

> Digite **cancelar** a qualquer momento para cancelar sua candidatura.

Boa sorte! ⚔️`
        );


    } catch {

        await interaction.reply({
            content:
                '❌ Não consegui enviar uma mensagem privada para você. Ative suas DMs e tente novamente.',
            ephemeral:
                true
        });

        return;

    }


    await interaction.reply({
        content:
            '📩 Te mandei uma DM! Continue seu recrutamento no privado.',
        ephemeral:
            true
    });


    applicationsInProgress.add(
        user.id
    );


    // ==================================================
    // ❓ PERGUNTAS
    // ==================================================

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
                            message.author.id ===
                            user.id,

                    max: 1,

                    time:
                        5 * 60 * 1000,

                    errors:
                        ['time']

                });


            const answer =
                collected
                    .first()
                    .content
                    .trim();


            // CANCELAR
            if (
                answer.toLowerCase() === 'cancel' ||
                answer.toLowerCase() === 'cancelar'
            ) {

                await dm.send(
`# ❌ CANDIDATURA CANCELADA

Sua candidatura foi cancelada.

Você poderá tentar novamente quando quiser.

> 🐺 HushPvP • Recrutamento`
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


        // ==================================================
        // 📤 CANAL DE ANÁLISE
        // ==================================================

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


        // ==================================================
        // ✅ BOTÃO ACEITAR
        // ==================================================

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


        // ==================================================
        // ❌ BOTÃO REJEITAR
        // ==================================================

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


        // ==================================================
        // 📋 CANDIDATURA PARA STAFF
        // ==================================================

        const applicationContainer =
            new ContainerBuilder()

                .setAccentColor(
                    0x009DFF
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
                MessageFlags.IsComponentsV2
        });


        await dm.send(
`# ✅ CANDIDATURA ENVIADA

Sua candidatura foi enviada com sucesso para a equipe do **HushPvP**.

Agora aguarde a análise dos administradores.

Você receberá o resultado aqui mesmo, pela sua DM.

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


    applicationsInProgress.delete(
        user.id
    );

});


// ======================================================
// ✅ ACEITAR / ❌ REJEITAR
// ======================================================

client.on('interactionCreate', async interaction => {

    if (!interaction.isButton()) return;


    const isAccept =
        interaction.customId.startsWith(
            'application_accept_'
        );

    const isReject =
        interaction.customId.startsWith(
            'application_reject_'
        );


    if (
        !isAccept &&
        !isReject
    ) return;


    // ==================================================
    // 🛡️ VERIFICAR PERMISSÃO
    // ==================================================

    const allowedRoles = [
        'owner',
        'owners',
        'admin',
        'admins',
        'administrator'
    ];


    const hasPermission =
        interaction.member.roles.cache.some(
            role =>
                allowedRoles.includes(
                    role.name.toLowerCase()
                )
        );


    if (!hasPermission) {

        await interaction.reply({
            content:
                '❌ Apenas Owner ou Admin pode analisar candidaturas.',
            ephemeral:
                true
        });

        return;

    }


    // ==================================================
    // 👤 PEGAR CANDIDATO
    // ==================================================

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


    try {

        const candidate =
            await client.users.fetch(
                userId
            );


        // ==================================================
        // ✅ ACEITAR
        // ==================================================

        if (isAccept) {

            try {

                await candidate.send(
`# 🎉 CANDIDATURA ACEITA!

Parabéns!

Sua candidatura para entrar na equipe do **HushPvP** foi **ACEITA**. ✅

Um administrador entrará em contato com você para informar os próximos passos.

Bem-vindo à equipe! 🐺⚔️

> HushPvP • Recrutamento`
                );

            } catch {}


            const acceptedContainer =
                new ContainerBuilder()

                    .setAccentColor(
                        0x00FF7F
                    )

                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(
`# ✅ CANDIDATURA ACEITA

👤 **Candidato:** ${candidate}

🛡️ **Analisado por:** ${interaction.user}

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


            console.log(
                `✅ ${candidate.tag} foi aceito por ${interaction.user.tag}`
            );

        }


        // ==================================================
        // ❌ REJEITAR
        // ==================================================

        if (isReject) {

            try {

                await candidate.send(
`# ❌ RESULTADO DA CANDIDATURA

Obrigado pelo interesse em fazer parte da equipe do **HushPvP**.

Após analisarmos sua candidatura, infelizmente ela **não foi aprovada desta vez**.

Você poderá tentar novamente em outra oportunidade.

Obrigado por participar. 💙

> 🐺 HushPvP • Recrutamento`
                );

            } catch {}


            const rejectedContainer =
                new ContainerBuilder()

                    .setAccentColor(
                        0xFF0000
                    )

                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(
`# ❌ CANDIDATURA REJEITADA

👤 **Candidato:** ${candidate}

🛡️ **Analisado por:** ${interaction.user}

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


            console.log(
                `❌ ${candidate.tag} foi rejeitado por ${interaction.user.tag}`
            );

        }


    } catch (error) {

        console.error(
            '❌ Erro ao analisar candidatura:',
            error
        );

    }

});


// ======================================================
// ❌ ERROS DO BOT
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

client.login(
    process.env.DISCORD_TOKEN
);
