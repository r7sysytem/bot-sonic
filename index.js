const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const TOKEN = process.env.TOKEN;

const STAFF_ROLE_ID = "1494276329825374269";
const TICKET_CATEGORY_ID = "1486641827552428043";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", function () {
  console.log("Bot is ready: " + client.user.tag);
});

function isStaff(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;

  if (message.content.trim() === "تكت") {
    const embed = new EmbedBuilder()
      .setTitle("☁️ EZ SUPPORT")
      .setDescription(
        "**أهلاً بك في الدعم الفني الخاص بالسيرفر**\n\n" +
        "يرجى قبل فتح التذكرة مراجعة القوانين.\n" +
        "عدم احترام الإدارة أو التقليل منهم لأي سبب يؤدي إلى المحاسبة.\n\n" +
        "> اضغط على القائمة بالأسفل واختر نوع التذكرة."
      )
      .setColor("#2f3136");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_menu")
      .setPlaceholder("اختر من هنا")
      .addOptions([
        {
          label: "دعم فني",
          description: "اضغط لفتح تكت دعم فني",
          value: "support_ticket",
          emoji: "⚙️"
        }
      ]);

    return message.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }

  if (message.content.startsWith("+rename")) {
    if (!message.channel.name.startsWith("ticket-")) return;
    if (!isStaff(message.member)) return message.reply("❌ هذا الأمر للإدارة فقط.");

    const newName = message.content.replace("+rename", "").trim();

    if (!newName) return message.reply("❌ اكتب الاسم الجديد بعد الأمر.");

    await message.channel.setName(newName).catch(function () {});
    return message.reply("✅ تم تغيير اسم التكت إلى: `" + newName + "`");
  }

  if (message.content.trim() === "?close") {
    if (!message.channel.name.startsWith("ticket-")) return;
    if (!isStaff(message.member)) return message.reply("❌ هذا الأمر للإدارة فقط.");

    await message.reply("🔒 سيتم إغلاق التكت خلال 5 ثواني...");
    setTimeout(function () {
      message.channel.delete().catch(function () {});
    }, 5000);
  }
});

client.on("interactionCreate", async function (interaction) {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "ticket_menu") {
      if (interaction.values[0] !== "support_ticket") return;

      const oldChannel = interaction.guild.channels.cache.find(function (ch) {
        return ch.name === "ticket-" + interaction.user.username.toLowerCase();
      });

      if (oldChannel) {
        return interaction.reply({
          content: "❌ عندك تكت مفتوح بالفعل: " + oldChannel.toString(),
          ephemeral: true
        });
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: "ticket-" + interaction.user.username,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },
          {
            id: STAFF_ROLE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.ManageMessages,
              PermissionsBitField.Flags.ManageChannels
            ]
          }
        ]
      });

      const ticketEmbed = new EmbedBuilder()
        .setTitle("🎫 أهلاً بك في الدعم الفني")});
      }

      await interaction.reply({
        content: "🔒 سيتم قفل التذكرة خلال 5 ثواني...",
        ephemeral: false
      });

      setTimeout(function () {
        interaction.channel.delete().catch(function () {});
      }, 5000);
    }
  }
});

client.login(TOKEN);
