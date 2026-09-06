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
// 📝 FUNÇÃO DO PAINEL DE RECRUTAMENTO
// ======================================================

async function sendRecruitmentPanel() {

    try {

        const channel = await client.channels.fetch(
            RECRUITMENT_CHANNEL_ID
        );

        if (!channel || !channel.isTextBased()) {
            console.log(
                '❌ Canal de recrutamento inválido.'
            );
            return;
        }


        // ==================================================
        // 🧹 APAGAR PAINEL ANTIGO
        // ==================================================

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

            for (const message of botMessages.values()) {
                await message.delete().catch(() => {});
            }

        } catch {}


        // ==================================================
        // 🔘 BOTÃO APPLY
        // ==================================================

        const applyButton =
            new ButtonBuilder()

                .setCustomId(
                    'hushpvp_apply'
                )

                .setLabel(
                    'Submit Application'
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


        // ==================================================
        // 📦 PAINEL
        // ==================================================

        const recruitmentContainer =
            new ContainerBuilder()

                .setAccentColor(
                    0x009DFF
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
`# 📝 HUSHPVP APPLICATIONS

## Recruitment Process — HushPvP Team

Welcome!

You are starting your application for the **HushPvP Staff Team**.

Please read the instructions carefully before proceeding.

### 📌 Important Guidelines

• Be honest in all your answers
• Do not spam applications
• Keep your Discord DMs enabled
• Applications must be taken seriously
• Never send passwords or sensitive information

### ✅ Basic Requirements

• Good communication skills
• Respectful attitude
• Maturity
• Activity within the community
• Ability to work as a team
• Commitment to HushPvP

📩 **Click the button below to begin your private application.**

> 🐺 HushPvP • Official Recruitment`
                        )
                )

                .addActionRowComponents(
                    row
                );


        await channel.send({
            components: [
                recruitmentContainer
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

client.once('ready', async () => {

    console.log('======================================');
    console.log(
        `🐺 HushPvP online como ${client.user.tag}`
    );
    console.log('======================================');


    // ==================================================
    // 🎮 STATUS
    // ==================================================

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


    // ==================================================
    // ⚔️ REGISTRAR /TEAM
    // ==================================================

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

                if (
                    messages.size > 0
                ) {

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

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction.isChatInputCommand()
        ) return;

        if (
            interaction.commandName !==
            'team'
        ) return;


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
                        member =>
                            `• ${member}`
                    )
                    : [];


            const admins =
                adminRole
                    ? adminRole.members.map(
                        member =>
                            `• ${member}`
                    )
                    : [];


            const staffs =
                staffRole
                    ? staffRole.members.map(
                        member =>
                            `• ${member}`
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
${owners.length ? owners.join('\n') : '• No members'}

# 🛡️ ADMIN
${admins.length ? admins.join('\n') : '• No members'}

# ⚔️ STAFF
${staffs.length ? staffs.join('\n') : '• No members'}

> 💙 HushPvP • Official Staff Team`
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

    }
);


// ======================================================
// 📝 BOTÃO APPLY
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


        if (
            applicationsInProgress.has(
                user.id
            )
        ) {

            await interaction.reply({
                content:
                    '⚠️ Você já possui uma candidatura em andamento na DM.',
                ephemeral:
                    true
            });

            return;
        }


        let dm;


        try {

            dm =
                await user.createDM();

            await dm.send(
`# 🐺 HUSHPVP RECRUITMENT

Hello ${user}!

Welcome to the **HushPvP Staff Recruitment Process**.

I will ask you a few questions.

Please answer them one by one.

> Type **cancel** at any moment to cancel your application.

Let's begin! ⚔️`
            );


        } catch {

            await interaction.reply({
                content:
                    '❌ Não consegui mandar DM. Ative suas mensagens privadas e tente novamente.',
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


        const questions = [

            '🎮 **1/7 — What is your Minecraft nickname?**',

            '🎂 **2/7 — How old are you?**',

            `🛡️ **3/7 — Which position are you applying for?**

• Staff
• Admin
• Moderator
• Builder
• Developer`,

            `📋 **4/7 — Do you have previous staff experience?**

Tell us which servers and positions.`,

            `⏰ **5/7 — How active can you be?**

Example:
• 2 hours/day
• 4 hours/day
• Weekends`,

            '🤝 **6/7 — Why do you want to join HushPvP?**',

            '⭐ **7/7 — Why should we choose you?**'

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

                        max:
                            1,

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


                if (
                    answer.toLowerCase() ===
                    'cancel'
                ) {

                    await dm.send(
`❌ **Application cancelled.**

You can apply again later.`
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
                    '✅ Answer saved!'
                );

            }


            // ==================================================
            // 📤 ENVIAR PARA STAFF
            // ==================================================

            const reviewChannel =
                await client.channels.fetch(
                    APPLICATION_REVIEW_CHANNEL_ID
                );


            const acceptButton =
                new ButtonBuilder()

                    .setCustomId(
                        `application_accept_${user.id}`
                    )

                    .setLabel(
                        'Accept'
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
                        'Reject'
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
                        0x009DFF
                    )

                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(
`# 📋 NEW STAFF APPLICATION

## 👤 Candidate
${user}

**Discord:** ${user.tag}
**User ID:** \`${user.id}\`

## 🎮 Minecraft Nick
${answers[0]}

## 🎂 Age
${answers[1]}

## 🛡️ Position
${answers[2]}

## 📋 Previous Experience
${answers[3]}

## ⏰ Availability
${answers[4]}

## 🤝 Why HushPvP?
${answers[5]}

## ⭐ Why should we choose you?
${answers[6]}

> 🐺 HushPvP Recruitment System`
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
`# ✅ APPLICATION SUBMITTED

Your application has been sent to the **HushPvP Staff Team**.

You will receive the result here in your DMs.

> 🐺 HushPvP Recruitment`
            );


        } catch {

            try {

                await dm.send(
`# ⏰ APPLICATION EXPIRED

You took too long to answer.

You can apply again whenever you're ready.`
                );

            } catch {}

        }


        applicationsInProgress.delete(
            user.id
        );

    }
);


// ======================================================
// ✅ ACCEPT / ❌ REJECT
// ======================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction.isButton()
        ) return;


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


        if (
            !hasPermission
        ) {

            await interaction.reply({
                content:
                    '❌ Apenas Owner/Admin pode analisar candidaturas.',
                ephemeral:
                    true
            });

            return;
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


        try {

            const candidate =
                await client.users.fetch(
                    userId
                );


            // ==================================================
            // ✅ ACCEPT
            // ==================================================

            if (
                isAccept
            ) {

                try {

                    await candidate.send(
`# 🎉 APPLICATION ACCEPTED!

Congratulations!

Your application to join the **HushPvP Staff Team** has been **ACCEPTED**. ✅

An administrator will contact you with the next steps.

Welcome to the team! 🐺⚔️

> HushPvP • Staff Recruitment`
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
`# ✅ APPLICATION ACCEPTED

👤 **Candidate:** ${candidate}

🛡️ **Reviewed by:** ${interaction.user}

## 🎉 RESULT
**ACCEPTED**

> 🐺 HushPvP Recruitment`
                                )
                        );


                await interaction.update({
                    components: [
                        acceptedContainer
                    ]
                });

            }


            // ==================================================
            // ❌ REJECT
            // ==================================================

            if (
                isReject
            ) {

                try {

                    await candidate.send(
`# ❌ APPLICATION RESULT

Thank you for your interest in joining the **HushPvP Staff Team**.

Unfortunately, your application was **not accepted at this time**.

You may have another opportunity in the future.

> 🐺 HushPvP • Staff Recruitment`
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
`# ❌ APPLICATION REJECTED

👤 **Candidate:** ${candidate}

🛡️ **Reviewed by:** ${interaction.user}

## RESULT
**REJECTED**

> 🐺 HushPvP Recruitment`
                                )
                        );


                await interaction.update({
                    components: [
                        rejectedContainer
                    ]
                });

            }


        } catch (error) {

            console.error(
                '❌ Erro ao analisar application:',
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
