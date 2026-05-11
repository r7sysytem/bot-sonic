const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

const TOKEN = process.env.TOKEN;

const STAFF_ROLE_ID = "1494276329825374269";
const HIGH_STAFF_ROLE_ID = "1494276545643282482";
const CATEGORY_ID = "1486641827552428043";

const claimedTickets = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", function () {
  console.log("Bot is online: " + client.user.tag);
});

function isStaff(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

function isHighStaff(member) {
  return member.roles.cache.has(HIGH_STAFF_ROLE_ID);
}

function isTicket(channel) {
  return channel.name.startsWith("ticket-");
}

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;

  if (message.content.trim() === "تكت") {
    const embed = new EmbedBuilder()
      .setTitle("📮 نظام الدعم الفني")
      .setDescription(
        "أهلاً بك في الدعم الفني.\n\n" +
        "اختر نوع التذكرة من القائمة بالأسفل.\n\n" +
        "⚠️ القوانين:\n" +
        "• يمنع السب والإزعاج.\n" +
        "• يمنع فتح تذكرة بدون سبب.\n" +
        "• أسرع إداري يستلم التذكرة يصبح المسؤول عنها.\n" +
        "• الإدارة العليا تستطيع التدخل بأي وقت."
      )
      .setColor("#a855f7");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_menu")
      .setPlaceholder("اختر نوع التذكرة")
      .addOptions([
        {
          label: "دعم فني",
          description: "فتح تذكرة دعم",
          value: "support",
          emoji: "📮"
        }
      ]);

    return message.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }

  if (message.content.startsWith("+rename")) {
    if (!isTicket(message.channel)) return;

    if (!isStaff(message.member) && !isHighStaff(message.member)) {
      return message.reply("❌ هذا الأمر للإدارة فقط.");
    }

    const newName = message.content.replace("+rename", "").trim();

    if (!newName) {
      return message.reply("❌ اكتب الاسم الجديد.");
    }

    await message.channel.setName("ticket-" + newName).catch(function () {});
    return message.reply("✅ تم تغيير اسم التكت إلى: ticket-" + newName);
  }

  if (message.content.startsWith("+add")) {
    if (!isTicket(message.channel)) return;

    if (!isStaff(message.member) && !isHighStaff(message.member)) {
      return message.reply("❌ هذا الأمر للإدارة فقط.");
    }

    const user = message.mentions.users.first();

    if (!user) {
      return message.reply("❌ منشن الشخص. مثال: +add @user");
    }

    await message.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    return message.reply("✅ تم إضافة " + user.toString() + " للتكت.");
  }

  if (message.content.trim() === "?close") {
    if (!isTicket(message.channel)) return;

    if (!isStaff(message.member) && !isHighStaff(message.member)) {
      return message.reply("❌ هذا الأمر للإدارة فقط.");
    }

    await message.reply("🔒 سيتم إغلاق التكت خلال 5 ثواني...");

    setTimeout(function () {
      claimedTickets.delete(message.channel.id);
      message.channel.delete().catch(function () {});
    }, 5000);
  }
});

client.on("interactionCreate", async function (interaction) {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "ticket_menu") {
      if (interaction.values[0] !== "support") return;

      const oldTicket = interaction.guild.channels.cache.find(function (channel) {
        return channel.name === "ticket-" + interaction.user.id;
      });

      if (oldTicket) {
        return interaction.reply({
          content: "❌ عندك تكت مفتوح بالفعل: " + oldTicket.toString(),
          ephemeral: true
        });
      }

      const ticket = await interaction.guild.channels.create({
        name: "ticket-" + interaction.user.id,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
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
              PermissionsBitField.Flags.ReadMessageHistory
            ],
            deny: [
              PermissionsBitField.Flags.SendMessages
            ]
          },
          {
            id: HIGH_STAFF_ROLE_ID,
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
        .setTitle("🎫 تم فتح التذكرة")
        .setDescription(
          "مرحباً " + interaction.user.toString() + "\n\n" +
          "يرجى شرح مشكلتك بالتفصيل.\n\n" +
          "━━━━━━━━━━━━━━\n\n" +
          "⚡ أسرع إداري يستلم التذكرة يصبح المسؤول عنها.\n" +
          "🔒 الإدارة الصغرى لا تستطيع الكتابة إلا بعد الاستلام.\n" +
          "👑 الإدارة العليا تستطيع الكتابة دائماً.\n\n" +
          "🛠️ أوامر الإدارة:\n" +
          "+rename الاسم\n" +
          "+add @user\n" +
          "?close\n\n" +
          "━━━━━━━━━━━━━━"
        )
        .setColor("#8b5cf6");

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim")
          .setLabel("استلام")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("close")
          .setLabel("قفل")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await ticket.send({
        content: "<@&" + STAFF_ROLE_ID + "> <@&" + HIGH_STAFF_ROLE_ID + ">",
        embeds: [ticketEmbed],
        components: [buttons]
      });

      return interaction.reply({
        content: "✅ تم فتح التذكرة: " + ticket.toString(),
        ephemeral: true
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "claim") {
      if (!isStaff(interaction.member) && !isHighStaff(interaction.member)) {
        return interaction.reply({
          content: "❌ هذا الزر للإدارة فقط.",
          ephemeral: true
        });
      }

      if (claimedTickets.has(interaction.channel.id)) {
        const claimerId = claimedTickets.get(interaction.channel.id);

        return interaction.reply({
          content: "❌ التذكرة مستلمة بالفعل بواسطة <@" + claimerId + ">",
          ephemeral: true
        });
      }

      claimedTickets.set(interaction.channel.id, interaction.user.id);

      await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        ManageMessages: true
      });

      await interaction.channel.permissionOverwrites.edit(STAFF_ROLE_ID, {
        ViewChannel: true,
        SendMessages: false,
        ReadMessageHistory: true
      });

      const claimEmbed = new EmbedBuilder()
        .setTitle("✅ تم استلام التذكرة")
        .setDescription(
          "تم استلام التذكرة بواسطة " + interaction.user.toString() + "\n\n" +
          "هذا الإداري أصبح المسؤول عن التذكرة.\n" +
          "لا يمكن لأي إداري آخر استلامها."
        )
        .setColor("#22c55e");

      return interaction.reply({
        embeds: [claimEmbed],
        ephemeral: false
      });
    }

    if (interaction.customId === "close") {
      if (!isStaff(interaction.member) && !isHighStaff(interaction.member)) {
        return interaction.reply({content: "❌ الإدارة فقط تقدر تقفل التكت.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content: "🔒 سيتم إغلاق التكت خلال 5 ثواني...",
        ephemeral: false
      });

      setTimeout(function () {
        claimedTickets.delete(interaction.channel.id);
        interaction.channel.delete().catch(function () {});
      }, 5000);
    }
  }
});

client.login(TOKEN);
