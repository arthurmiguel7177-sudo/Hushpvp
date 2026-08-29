require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
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

            // 1. Prepara o arquivo do banner
            const banner = new AttachmentBuilder('./regras.png');

            // 2. Envia o banner sozinho primeiro (ficando no topo absoluto)
            await rulesChannel.send({ files: [banner] });

            // 3. Cria o Embed com as regras grandes e a linha lateral azul (.setColor)
            const embedRegras = new EmbedBuilder()
                .setColor('#00bfff') // Linha azul lateral do embed
                .setTitle('📜 SERVER RULES — HUSHPVP')
                .setDescription('To maintain a fair, competitive and enjoyable environment, all players must follow the rules below strictly.')
                .addFields(
                    { 
                        name: '🔇 ━━━━━━━━ CHAT MUTES ━━━━━━━━ 🔇', 
                        value: '• **Links não autorizados:** Divulgação de links maliciosos, convites de outros servers ou IPs externos.\n' +
                               '• **Flood e Spam:** Enviar mensagens repetidas, símbolos em excesso ou poluir o chat global.\n' +
                               '• **Toxicidade e Desrespeito:** Ofensas leves, provocações excessivas, xingamentos ou falta de educação com membros.\n' +
                               '• **Comércio Irregular:** Venda de itens, contas ou serviços fora dos canais de negociação permitidos.\n' +
                               '• **Palavras Inadequadas:** Uso de linguagem imprópria ou burlar filtros de chat do servidor.\n' +
                               '• **Discriminação Leve:** Comentários preconceituosos de baixo impacto ou piadas ofensivas.', 
                        inline: false 
                    },
                    { 
                        name: '⛔ ━━━━━━━━ PERMANENT CHAT MUTES ━━━━━━━━ ⛔', 
                        value: '• **Assédio e Bullying:** Perseguição contínua, humilhação ou ataques direcionados a um jogador.\n' +
                               '• **Preconceito Grave:** Racismo, homofobia, xenofobia, intolerância religiosa ou discursos de ódio.\n' +
                               '• **Apologia a Crimes:** Incentivo a suicídio, automutilação, drogas ou atos ilícitos graves.\n' +
                               '• **Provocação Extrema:** Xingamentos pesados e agressão verbal reincidente no chat.\n' +
                               '• **Conteúdo NSFW / 18+:** Envio de imagens, textos ou links com conteúdos adultos ou explícitos.', 
                        inline: false 
                    },
                    { 
                        name: '👢 ━━━━━━━━ KICKS ━━━━━━━━ 👢', 
                        value: '• **Atrapalhar a Staff:** Interferir intencionalmente no trabalho da moderação ou comandos de suporte.\n' +
                               '• **Abuso de Reports:** Enviar tickets ou denúncias falsas repetidas vezes para tumultuar o atendimento.\n' +
                               '• **Antijogo Leve:** Comportamentos dentro das partidas que estraguem a experiência coletiva dos aliados.\n' +
                               '• **Desconexão Tática:** Tentar forçar quedas de conexão para fugir de situações de combate ou regras.', 
                        inline: false 
                    },
                    { 
                        name: '🔨 ━━━━━━━━ BANS E PUNIÇÕES GERAIS ━━━━━━━━ 🔨', 
                        value: '• **Uso de Cheats/Hacks:** Qualquer modificação ilegal no client (Reach, KillAura, X-Ray, Fly, Autoclicker, Macros).\n' +
                               '• **Exploração de Bugs (Abuse):** Aproveitar-se de falhas de plugins, mapas ou duplicações para obter vantagens.\n' +
                               '• **Falsificação de Identidade:** Fingir ser dono, adm, moderador ou criador de conteúdo do servidor.\n' +
                               '• **Roubo e Golpes:** Enganar jogadores em trocas, comércio de coins/itens ou roubar dados de contas.\n' +
                               '• **Ban Evading:** Criar contas alternativas (fakes) para entrar no servidor após ter recebido um banimento permanente.', 
                        inline: false 
                    }
                )
                .setFooter({ text: 'HushPvP • Jogue limpo. Respeite os outros. Seja competitivo. ⚔️' })
                .setTimestamp();

            // 4. Envia o embed logo abaixo da imagem, mantendo a lateral azul
            await rulesChannel.send({ embeds: [embedRegras] });
            console.log('Banner no topo e painel de regras enviados com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao enviar as regras:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
