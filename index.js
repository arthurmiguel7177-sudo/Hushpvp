require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot do HushPvP está online!');
});

app.listen(PORT, () => {
    console.log(`Servidor web rodando na porta ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`Bot logado como ${client.user.tag}!`);

    try {
        const voiceChannel = await client.channels.fetch(process.env.CHANNEL_ID);
        if (voiceChannel) {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            console.log(`Conectado no canal de voz: ${voiceChannel.name}`);
        }
    } catch (error) {
        console.error('Erro no canal de voz:', error);
    }

    try {
        const rulesChannel = await client.channels.fetch(process.env.CANAL_REGRAS_ID);
        if (rulesChannel && rulesChannel.isTextBased()) {
            const messages = await rulesChannel.messages.fetch({ limit: 10 });
            if (messages.size > 0) {
                await rulesChannel.bulkDelete(messages).catch(() => {});
            }

            const embedRegras = new EmbedBuilder()
                .setColor('#00bfff')
                .setTitle('📜 REGRAS OFICIAIS — HUSHPVP')
                .setDescription('⚔️ **HushPvP** — Jogue limpo, respeite a comunidade e divirta-se!')
                .addFields(
                    { name: '1. 🤝 Respeito', value: 'Respeite todos os jogadores e membros da equipe. Ofensas, ameaças, preconceito e perseguição não serão tolerados.\n*Punição: Mute ou Ban, dependendo da gravidade.*' },
                    { name: '2. 🚫 Hacks e Cheats', value: 'É proibido utilizar qualquer tipo de hack, cheat, autoclicker, macro ou modificação que ofereça vantagem injusta.\n*Punição: Ban permanente.*' },
                    { name: '3. 🐛 Exploração de Bugs', value: 'Não é permitido explorar bugs, glitches ou falhas do servidor para obter vantagens.\n*Punição: Ban ou punição definida pela equipe.*' },
                    { name: '4. 📢 Divulgação', value: 'É proibida a divulgação de outros servidores, Discords, sites ou comunidades sem autorização da equipe.\n*Punição: Mute ou Ban.*' },
                    { name: '5. 💬 Spam', value: 'Não envie mensagens repetidas, flood, textos excessivamente grandes ou mensagens que atrapalhem o chat.\n*Punição: Mute temporário.*' },
                    { name: '6. 🔗 Links Suspeitos', value: 'Não envie links maliciosos, golpes, phishing ou conteúdos destinados a prejudicar outros jogadores.\n*Punição: Ban permanente.*' },
                    { name: '7. 🎭 Falsificação de Identidade', value: 'É proibido se passar por membros da equipe ou por outros jogadores com a intenção de enganar alguém.\n*Punição: Ban temporário ou permanente.*' },
                    { name: '8. 🏆 Abuso de Bugs em Eventos', value: 'É proibido utilizar bugs ou falhas para conseguir vantagem em eventos, torneios ou competições.\n*Punição: Desclassificação + punição.*' },
                    { name: '9. 🗣️ Toxicidade', value: 'Provocações excessivas, humilhações, assédio e comportamento tóxico contra outros jogadores são proibidos.\n*Punição: Mute ou Ban, conforme a gravidade.*' },
                    { name: '10. 💰 Golpes e Fraudes', value: 'É proibido tentar enganar jogadores em negociações, vendas, trocas ou qualquer sistema econômico.\n*Punição: Ban temporário ou permanente.*' },
                    { name: '11. 👥 Contas Alternativas', value: 'O uso de contas alternativas para escapar de punições ou prejudicar a experiência de outros jogadores é proibido.\n*Punição: Ban das contas envolvidas.*' },
                    { name: '12. ⚔️ Anti-Jogo', value: 'Não é permitido utilizar métodos ou comportamentos destinados exclusivamente a atrapalhar partidas, eventos ou outros jogadores.\n*Punição: Advertência ou mute.*' },
                    { name: '13. 👑 Abuso de Permissões', value: 'Membros da equipe não podem utilizar suas permissões para obter vantagens pessoais ou prejudicar jogadores.\n*Punição: Remoção da equipe + punição.*' },
                    { name: '14. 🔐 Segurança da Conta', value: 'Cada jogador é responsável pela segurança da própria conta. Nunca compartilhe sua senha. A equipe nunca solicitará sua senha.' },
                    { name: '15. ⚖️ Decisões da Equipe', value: 'As decisões da equipe devem ser respeitadas. Utilize o sistema oficial de revisão/appeal em caso de injustiça.\n*Tentativa de burlar punição gera punição adicional.*' }
                )
                .setFooter({ text: 'HushPvP • Jogue limpo. Respeite os outros. Seja competitivo. ⚔️' })
                .setTimestamp();

            const embedPunicoes = new EmbedBuilder()
                .setColor('#ff4500')
                .setTitle('⚠️ SISTEMA DE PUNIÇÕES')
                .setDescription('As punições podem variar de acordo com a gravidade e reincidência:\n\n' +
                    '🟢 **Leve:** Advertência / Mute\n' +
                    '🟡 **Média:** Mute prolongado / Kick / Ban temporário\n' +
                    '🔴 **Grave:** Ban temporário ou permanente\n\n' +
                    '*A equipe do HushPvP pode ajustar a punição de acordo com as circunstâncias do caso.*');

            await rulesChannel.send({ embeds: [embedRegras, embedPunicoes] });
            console.log('Painel de regras enviado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao enviar as regras:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
