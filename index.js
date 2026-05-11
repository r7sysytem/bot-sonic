const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (message.content === "قوانين") {

    const embed = new EmbedBuilder()
      .setTitle("📜 قوانين السيرفر")
      .setDescription(
        "مرحباً بك في سيرفرنا.\n\n" +
        "01・يمنع السب أو التقليل من أي عضو.\n" +
        "02・يمنع العنصرية والإساءة.\n" +
        "03・يمنع نشر الروابط بدون إذن.\n" +
        "04・يمنع السبام والمنشن العشوائي.\n" +
        "05・يمنع النصب أو الاحتيال.\n" +
        "06・احترام الإدارة واجب.\n" +
        "07・أي مخالفة تعرضك للعقوبة.\n\n" +
        "نتمنى لك وقتاً ممتعاً ❤️"
      )
      .setColor("#8b5cf6");

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("rules")
          .setLabel("موافق")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("ticket")
          .setLabel("تذكرة")
          .setEmoji("🎫")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("news")
          .setLabel("إعلانات")
          .setEmoji("📢")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("exchange")
          .setLabel("تبادل")
          .setEmoji("🔁")
          .setStyle(ButtonStyle.Secondary)
      );

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

client.on("interactionCreate", async interaction => {

  if (!interaction.isButton()) return;

  if (interaction.customId === "rules") {
    interaction.reply({
      content: "✅ شكراً لموافقتك على القوانين",
      ephemeral: true
    });
  }

  if (interaction.customId === "ticket") {
    interaction.reply({
      content: "🎫 توجه لروم التذاكر",
      ephemeral: true
    });
  }

  if (interaction.customId === "news") {
    interaction.reply({
      content: "📢 تابع روم الإعلانات",
      ephemeral: true
    });
  }

  if (interaction.customId === "exchange") {
    interaction.reply({
      content: "🔁 التبادل التلقائي متاح بالروم المخصص",
      ephemeral: true
    });
  }

});

client.login(TOKEN);
