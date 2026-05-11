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
      .setTitle("📮 الدعم الفني")
      .setDescription(
        "أهلاً بك في الدعم الفني الخاص بالسيرفر.\n\n" +
        "يرجى قبل فتح التذكرة مراجعة القوانين.\n" +
        "عدم احترام الإدارة أو التقليل منهم لأي سبب يؤدي إلى المحاسبة.\n\n" +
        "اضغط على القائمة بالأسفل واختر دعم فني."
      )
      .setColor("#8b5cf6");

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
    return message.reply("✅ تم تغيير اسم التكت إلى: " + newName);
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
        return ch.name === "ticket-" + interaction.user.id;
      });

      if (oldChannel) {
        return interaction.reply({
          content: "❌ عندك تكت مفتوح بالفعل: " + oldChannel.toString(),
          ephemeral: true
        });
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: "ticket-" + interaction.user.id,
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
        .setTitle("🎫 أهلاً بك في الدعم الفني")
        .setDescription("<@" + interaction.user.id + "> | <@&" + STAFF_ROLE_ID + ">\n\n" +
          "يرجى الانتظار، سيتم خدمتك من قبل الإدارة قريباً.\n\n" +
          "أوامر الإدارة:\n" +
          "+rename الاسم\n" +
          "?close"
        )
        .setColor("#8b5cf6");

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
              value: "warn_user",
              emoji: "⚠️"
            },
            {
              label: "تغيير اسم التكت",
              description: "طريقة تغيير اسم التكت",
              value: "rename_info",
              emoji: "✏️"
            },
            {
              label: "قفل التكت",
              description: "إغلاق التذكرة",
              value: "close_ticket_menu",
              emoji: "🔒"
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
      if (!isStaff(interaction.member)) {
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

      if (value === "rename_info") {
        return interaction.reply({
          content: "✏️ لتغيير اسم التكت اكتب:\n+rename الاسم-الجديد",
          ephemeral: true
        });
      }

      if (value === "close_ticket_menu") {
        await interaction.reply({
          content: "🔒 سيتم إغلاق التكت خلال 5 ثواني...",
          ephemeral: false
        });

        return setTimeout(function () {
          interaction.channel.delete().catch(function () {});
        }, 5000);
      }

      if (value === "ticket_info") {
        return interaction.reply({
          content:
            "📌 معلومات التكت:\n" +
            "الروم: " + interaction.channel.toString() + "\n" +
            "الإدارة: <@&" + STAFF_ROLE_ID + ">\n" +
            "للإغلاق: ?close\n" +
            "لتغيير الاسم: +rename الاسم",
          ephemeral: true
        });
      }
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "claim_ticket") {
      if (!isStaff(interaction.member)) {
        return interaction.reply({
          content: "❌ هذا الزر للإدارة فقط.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("✅ تم استلام التذكرة")
        .setDescription("تم استلام التذكرة بواسطة " + interaction.user.toString())
        .setColor("#22c55e");

      return interaction.reply({
        embeds: [embed],
        ephemeral: false
      });
    }

    if (interaction.customId === "close_ticket") {
      if (!isStaff(interaction.member)) {
        return interaction.reply({
          content: "❌ الإدارة فقط تقدر تقفل التكت.",
          ephemeral: true
        });
      }

      await interaction.reply({content: "🔒 سيتم قفل التذكرة خلال 5 ثواني...",
        ephemeral: false
      });

      setTimeout(function () {
        interaction.channel.delete().catch(function () {});
      }, 5000);
    }
  }
});

client.login(TOKEN);
