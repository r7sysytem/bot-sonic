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

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;

  if (message.content.trim() === "تكت") {
    const embed = new EmbedBuilder()
      .setTitle("☁️ الدعم الفني الخاص")
      .setDescription(
        "**أهلاً بك في الدعم الفني الخاص بالسيرفر**\n\n" +
        "يرجى قبل فتح التذكرة مراجعة القوانين.\n" +
        "عدم احترام الإدارة أو التقليل منهم لأي سبب قد يؤدي إلى محاسبتك.\n\n" +
        "> General laws\n" +
        "Disrespecting the administration or belittling them for any reason leads to punishment."
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

    const row = new ActionRowBuilder().addComponents(menu);

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
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
              PermissionsBitField.Flags.ManageMessages
            ]
          }
        ]
      });

      const ticketEmbed = new EmbedBuilder()
        .setTitle("أهلاً بك في الدعم الفني")
        .setDescription(
          "<@" + interaction.user.id + "> | <@&" + STAFF_ROLE_ID + ">\n\n" +
          "يرجى الانتظار، سيتم خدمتك من قبل الإدارة قريباً."
        )
        .setColor("#2f3136");

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("استلام")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("قفل")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      const controlMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("admin_panel")
          .setPlaceholder("لوحة تحكم الإدارة")
          .addOptions([
            {
              label: "تنبيه العضو",
              description: "إرسال تنبيه داخل التكت",
              value: "warn_user",emoji: "⚠️"
            },
            {
              label: "معلومات التكت",
              description: "عرض معلومات التذكرة",
              value: "ticket_info",
              emoji: "📌"
            }
          ])
      );

      await ticketChannel.send({
        content: "<@&" + STAFF_ROLE_ID + ">",
        embeds: [ticketEmbed],
        components: [buttons, controlMenu]
      });

      return interaction.reply({
        content: "✅ تم فتح التكت: " + ticketChannel.toString(),
        ephemeral: true
      });
    }

    if (interaction.customId === "admin_panel") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({
          content: "❌ هذا الخيار للإدارة فقط.",
          ephemeral: true
        });
      }

      const value = interaction.values[0];

      if (value === "warn_user") {
        return interaction.reply({
          content: "⚠️ يرجى من صاحب التذكرة توضيح طلبه والانتظار حتى يتم الرد عليه.",
          ephemeral: false
        });
      }

      if (value === "ticket_info") {
        return interaction.reply({
          content:
            "📌 معلومات التكت:\n" +
            "• الروم: " + interaction.channel.toString() + "\n" +
            "• المسؤولين: <@&" + STAFF_ROLE_ID + ">",
          ephemeral: true
        });
      }
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "claim_ticket") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({
          content: "❌ هذا الزر للإدارة فقط.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: "✅ تم استلام التذكرة بواسطة " + interaction.user.toString(),
        ephemeral: false
      });
    }

    if (interaction.customId === "close_ticket") {
      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({
          content: "❌ الإدارة فقط تقدر تقفل التكت.",
          ephemeral: true
        });
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
