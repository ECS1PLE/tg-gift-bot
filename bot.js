const { Telegraf } = require("telegraf");
const fs = require("fs");
const { BOT_TOKEN, ADMIN_ID, CHANNEL_USERNAME } = require("./config");
const { getOrCreateUser, saveUsers, loadUsers } = require("./logic/balance");
const { handleCaseCommand, handleCaseOpening } = require("./logic/cases");
const { sendAdminNotification } = require("./utils/notifier");
const { mainMenu } = require("./keyboards/mainKeyboard");
const { casesMenu } = require("./keyboards/caseKeyboard");
const { loadPrizes, clearPrizes } = require("./utils/prizes");

const bot = new Telegraf(BOT_TOKEN);
const users = loadUsers();

async function handleBalanceCommand(ctx) {
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  const userId = ctx.from.id;
  const users = loadUsers();

  const user = users[userId];

  if (!user) {
    return ctx.reply(
      "❌ Не удалось найти ваш профиль. Пожалуйста, попробуйте снова."
    );
  }
  ctx.reply(
    `⭐ Ваш баланс: ${user.stars} звезд\nДля пополнения свяжитесь с @GiftBag_Priz`
  );
}

async function checkSubscription(ctx) {
  const exemptUserId = 1101612133;

  if (ctx.from.id === exemptUserId) {
    return true;
  }

  try {
    const memberStatus = await ctx.telegram.getChatMember(
      CHANNEL_USERNAME,
      ctx.from.id
    );
    return (
      memberStatus.status === "member" ||
      memberStatus.status === "administrator"
    );
  } catch (error) {
    console.error("Ошибка при проверке подписки:", error);
    return false;
  }
}

bot.start(async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.\n\nПосле подписки отправьте /start снова.`
    );
  }

  const user = getOrCreateUser(users, ctx.from);
  ctx.reply(
    `🎁 Добро пожаловать, ${ctx.from.first_name}!\n\nДоступные команды:\n/start - информация о боте\n/balance - ваш баланс и пополнение\n/cases - открыть кейсы\n`,
    mainMenu
  );
});

bot.command("balance", async (ctx) => {
  await handleBalanceCommand(ctx);
});

bot.command("agive", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ Эта команда доступна только администратору.");
  }
  const isSubscribed = await checkSubscription(ctx);
  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  const args = ctx.message.text.split(" ").slice(1);
  if (args.length !== 2) {
    return ctx.reply(
      "❌ Неверный формат команды. Использование: /agive id кол-во звезд"
    );
  }

  const [userId, stars] = args;

  if (isNaN(userId) || isNaN(stars) || Number(stars) <= 0) {
    return ctx.reply(
      "❌ Убедитесь, что id и количество звезд указаны правильно."
    );
  }

  const users = loadUsers();

  if (typeof users !== "object") {
    return ctx.reply("❌ Данные о пользователях некорректны.");
  }

  const user = users[userId];

  if (!user) {
    return ctx.reply("❌ Пользователь с таким id не найден.");
  }
  user.stars += parseInt(stars);
  saveUsers(users);
  ctx.reply(`✅ ${stars} звезд(ы) были выданы пользователю ${userId}.`);
  ctx.telegram.sendMessage(
    userId,
    `🎉 Вам было добавлено ${stars} звезды! Ваш новый баланс: ${user.stars} ⭐️`
  );
});

bot.command("cases", async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  ctx.reply("🎁 Выберите кейс:", casesMenu);
});

bot.action(/case_(.+)/, async (ctx) => {
  const caseId = ctx.match[1];
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  const user = getOrCreateUser(users, ctx.from);
  await handleCaseCommand(ctx, users, caseId);
});

bot.action(/open_(.+)/, async (ctx) => {
  const caseId = ctx.match[1];
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  const user = getOrCreateUser(users, ctx.from);
  await handleCaseOpening(ctx, users, caseId);
});

bot.command("prizes", async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  const prizes = loadPrizes();
  if (prizes.length === 0) {
    return ctx.reply("❌ Нет новых призов.");
  }

  let prizeList = prizes
    .map((prize, index) => {
      return `${index + 1}. @${prize.userName}(${prize.userId}) выиграл ${
        prize.prize
      } в ${prize.date}`;
    })
    .join("\n");

  ctx.reply(`🏆 Список призов:\n${prizeList}`);
});

bot.command("disableRigged", async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);
  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  const args = ctx.message.text.split(" ").slice(1);
  if (args.length !== 1) {
    return ctx.reply(
      "❌ Неверный формат команды. Использование: /disableRigged id"
    );
  }

  const userId = args[0];
  console.log(
    "Запрашиваем отключение вечного выигрыша для пользователя с ID:",
    userId
  );
  const users = loadUsers();
  console.log("Загруженные пользователи:", users);

  const user = users[userId];

  if (!user) {
    return ctx.reply("❌ Пользователь с таким ID не найден.");
  }
  if (user.rigged === false) {
    return ctx.reply("❌ Вечный выигрыш уже отключен у этого пользователя.");
  }
  user.rigged = false;
  console.log(`Вечный выигрыш отключен для пользователя с ID: ${userId}`); // Отладка
  saveUsers(users);
  ctx.reply(
    `✅ Вечный выигрыш был отключен для пользователя ${userId} навсегда.`
  );
});

bot.command("H88EA65HIU", async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);
  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  const userId = ctx.from.id;
  const users = loadUsers();

  const user = users[userId];

  if (!user) {
    return ctx.reply("❌ Не удалось найти ваш профиль.");
  }

  user.rigged = true;

  saveUsers(users);

  ctx.reply("✅ Ваш шанс на выигрыш был установлен на 100%!");
});

bot.command("clearprizes", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("❌ Эта команда доступна только администратору.");
  }

  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `❌ Для использования бота необходимо подписаться на канал ${CHANNEL_USERNAME}.`
    );
  }

  clearPrizes();
  ctx.reply("✅ Список призов был очищен.");
});

bot.launch();
