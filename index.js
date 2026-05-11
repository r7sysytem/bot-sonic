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

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

const TOKEN = process.env.TOKEN;

const STAFF_ROLE_ID = "1494276329825374269";
const HIGH_STAFF_ROLE_ID = "1494276545643282482";
const CATEGORY_ID = "1486641827552428043";

const claimedTickets = new Map();

client.once("ready", () => {
console.log(`${client.user.tag} Online`);
});

function isStaff(member) {
return member.roles.cache.has(STAFF_ROLE_ID);
}

function isHighStaff(member) {
return member.roles.cache.has(HIGH_STAFF_ROLE_ID);
}

client.on("messageCreate", async (message) => {

if (message.author.bot) return;

// إرسال بانل التكت
if (message.content === "تكت") {

const embed = new EmbedBuilder()
.setTitle("📮 نظام الدعم الفني")
.setDescription(`
# أهلاً بك في الدعم الفني

> اختر نوع التذكرة من القائمة بالأسفل

⚠️ القوانين:
• يمنع السب والإزعاج
• يمنع فتح تذكرة بدون سبب
• أسرع إداري يستلم التذكرة يصبح المسؤول عنها
• الإدارة العليا تستطيع التدخل بأي وقت
`)
.setColor("#a855f7")
.setImage("https://media.discordapp.net/attachments/132/example.gif");

const menu =
new StringSelectMenuBuilder()
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

const row =
new ActionRowBuilder().addComponents(menu);

return message.channel.send({
embeds: [embed],
components: [row]
});
}

// تغيير الاسم
if (message.content.startsWith("+rename")) {

if (!message.channel.name.startsWith("🎫・")) return;

if (!isStaff(message.member) && !isHighStaff(message.member)) {
return;
}

const newName =
message.content.replace("+rename", "").trim();

if (!newName) {
return message.reply("❌ اكتب الاسم");
}

await message.channel.setName(`🎫・${newName}`);

message.reply(`✅ تم تغيير الاسم إلى ${newName}`);
}

// إضافة عضو
if (message.content.startsWith("+add")) {

if (!message.channel.name.startsWith("🎫・")) return;

if (!isStaff(message.member) && !isHighStaff(message.member)) {
return;
}

const user =
message.mentions.users.first();

if (!user) {
return message.reply("❌ منشن الشخص");
}

await message.channel.permissionOverwrites.edit(user.id, {
ViewChannel: true,
SendMessages: true,
ReadMessageHistory: true
});

message.reply(`✅ تم إضافة ${user}`);
}

// قفل التكت
if (message.content === "?close") {

if (!message.channel.name.startsWith("🎫・")) return;

if (!isStaff(message.member) && !isHighStaff(message.member)) {
return;
}

message.channel.send("🔒 سيتم إغلاق التذكرة خلال 5 ثواني");

setTimeout(() => {
claimedTickets.delete(message.channel.id);
message.channel.delete().catch(() => {});
}, 5000);
}

});

// التفاعل
client.on("interactionCreate", async (interaction) => {

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "ticket_menu") {

const oldTicket =
interaction.guild.channels.cache.find(
c => c.name === 🎫・${interaction.user.username}
);

if (oldTicket) {

return interaction.reply({
content: ❌ عندك تكت مفتوح بالفعل ${oldTicket},
ephemeral: true
});
}

const ticket =
await interaction.guild.channels.create({

name: 🎫・${interaction.user.username},

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

// الإدارة الصغرى تشوف فقط
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

// الإدارة العليا تتكلم دائم
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

});const embed =
new EmbedBuilder()
.setTitle("🎫 تم فتح التذكرة")
.setDescription(`
مرحباً ${interaction.user}

يرجى شرح مشكلتك بالتفصيل.

━━━━━━━━━━━━━━

⚡ أسرع إداري يستلم التذكرة يصبح المسؤول عنها

🛠️ أوامر الإدارة:

+rename الاسم
+add @user
?close

━━━━━━━━━━━━━━
`)
.setColor("#8b5cf6");

const buttons =
new ActionRowBuilder().addComponents(

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
content:
<@&${STAFF_ROLE_ID}> <@&${HIGH_STAFF_ROLE_ID}>,
embeds: [embed],
components: [buttons]
});

interaction.reply({
content: ✅ تم فتح التذكرة ${ticket},
ephemeral: true
});
}
}

// الأزرار
if (interaction.isButton()) {

// استلام
if (interaction.customId === "claim") {

if (!isStaff(interaction.member) &&
!isHighStaff(interaction.member)) {

return interaction.reply({
content: "❌ للإدارة فقط",
ephemeral: true
});
}

// إذا مستلمة
if (claimedTickets.has(interaction.channel.id)) {

const claimer =
claimedTickets.get(interaction.channel.id);

return interaction.reply({
content:
❌ التذكرة مستلمة بالفعل بواسطة <@${claimer}>,
ephemeral: true
});
}

// حفظ المستلم
claimedTickets.set(
interaction.channel.id,
interaction.user.id
);

// السماح للمستلم فقط
await interaction.channel.permissionOverwrites.edit(
interaction.user.id,
{
SendMessages: true,
ViewChannel: true,
ReadMessageHistory: true
}
);

const embed =
new EmbedBuilder()
.setTitle("✅ تم استلام التذكرة")
.setDescription(`
👤 الإدارة:
${interaction.user}

⚡ هذا الإداري أصبح المسؤول عن التذكرة

• لا يمكن لأي إداري آخر استلامها
`)
.setColor("#22c55e");

interaction.reply({
embeds: [embed]
});
}

// قفل
if (interaction.customId === "close") {

if (!isStaff(interaction.member) &&
!isHighStaff(interaction.member)) {

return;
}

interaction.channel.send(
"🔒 سيتم إغلاق التذكرة خلال 5 ثواني"
);

setTimeout(() => {
claimedTickets.delete(interaction.channel.id);
interaction.channel.delete().catch(() => {});
}, 5000);

}

}

});

client.login(TOKEN);
