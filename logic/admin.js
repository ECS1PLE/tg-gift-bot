const { saveUsers } = require("./balance");

/**
 * @param {Object} ctx
 * @param {Object} users
 */
function giveStarsToUser(ctx, users) {
  if (ctx.from.id !== process.env.ADMIN_ID) {
    return ctx.reply("❌ Эта команда доступна только администратору.");
  }

  const [_, userId, stars] = ctx.message.text.split(" ");

  if (!userId || !stars) {
    return ctx.reply(
      "⚠️ Использование: /agive <ID пользователя> <количество звезд>"
    );
  }

  const starsToGive = parseInt(stars, 10);

  if (isNaN(starsToGive) || starsToGive <= 0) {
    return ctx.reply("⚠️ Количество звезд должно быть положительным числом.");
  }

  const user = users[userId];
  if (!user) {
    return ctx.reply("⚠️ Пользователь с таким ID не найден.");
  }

  user.stars += starsToGive;

  saveUsers(users);

  ctx.reply(`✅ Выдано ${starsToGive} звезд пользователю ${userId}.`);
  ctx.telegram.sendMessage(
    userId,
    `💰 Вам выдано ${starsToGive} звезд от администратора.`
  );
}

module.exports = { giveStarsToUser };
