const fs = require("fs");
const { sendAdminNotification } = require("../utils/notifier");

const caseOptions = {
  serdce: { name: "Сердце", cost: 7, winRate: 0.15, prize: "💝 Сердце" },
  medved: { name: "Медведь", cost: 7, winRate: 0.15, prize: "🧸 Медведь" },
  podarok: { name: "Подарок", cost: 12, winRate: 0.15, prize: "🎁 Подарок" },
  roza: { name: "Роза", cost: 12, winRate: 0.15, prize: "🌹 Роза" },
  tort: { name: "Торт", cost: 25, winRate: 0.15, prize: "🎂 Торт" },
  buquet: { name: "Букет", cost: 25, winRate: 0.15, prize: "💐 Букет" },
  butylka: { name: "Бутылка", cost: 25, winRate: 0.15, prize: "🍾 Бутылка" },
  raketa: { name: "Ракета", cost: 25, winRate: 0.15, prize: "🚀 Ракета" },
  kubok: { name: "Кубок", cost: 50, winRate: 0.15, prize: "🏆 Кубок" },
  kolco: { name: "Кольцо", cost: 50, winRate: 0.15, prize: "💍 Кольцо" },
  almaz: { name: "Алмаз", cost: 50, winRate: 0.15, prize: "💎 Алмаз" },
  lollipopNFT: {
    name: "Леденец NFT",
    cost: 10,
    winRate: 0.01,
    prize: "🍭 Леденец NFT",
  },
};

function loadUsers() {
  const data = fs.readFileSync("./data/users.json", "utf8");
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2), "utf8");
}

function handleCaseCommand(ctx) {
  const users = loadUsers();
  const user = users[ctx.from.id];
  const caseId = ctx.match[1];
  const selected = caseOptions[caseId];

  if (!selected) return ctx.reply("Кейс не найден.");
  console.log("Данные пользователя перед проверкой баланса:", user);

  const userStars = Number(user.stars);
  const caseCost = Number(selected.cost);

  if (userStars < caseCost) {
    console.log(
      `Баланс пользователя (${userStars}) недостаточен для открытия кейса с ценой (${caseCost})`
    );
    return ctx.reply("❌ Недостаточно звезд.");
  }

  ctx.reply(
    `Вы уверены, что хотите открыть "${selected.name}"? Шанс выигрыша: ${
      user.rigged
        ? "100%"
        : caseId === "lollipopNFT"
        ? `${selected.winRate * 100}%`
        : "45%"
    }`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Оплатить ${selected.cost}⭐️`,
              callback_data: `open_${caseId}`,
            },
          ],
        ],
      },
    }
  );
}

function handleCaseOpening(ctx) {
  const users = loadUsers();
  const user = users[ctx.from.id];
  const caseId = ctx.match[1];
  const selected = caseOptions[caseId];

  console.log("Данные пользователя перед открытием кейса:", user);

  const userStars = Number(user.stars);
  const caseCost = Number(selected.cost);

  if (userStars < caseCost) {
    console.log(
      `Баланс пользователя (${userStars}) недостаточен для открытия кейса с ценой (${caseCost})`
    );
    return ctx.reply("❌ У вас недостаточно звезд для открытия этого кейса.");
  }

  user.stars -= caseCost;

  console.log("Баланс пользователя после открытия кейса:", user.stars);

  const win = user.rigged || Math.random() <= selected.winRate;

  if (win) {
    ctx.reply(
      `🎉 Поздравляем! Вы выиграли ${selected.prize} \n Отпишите @GiftBag_Priz для получения приза`
    );
    sendAdminNotification(user, selected.prize);
  } else {
    ctx.reply("😢 Увы, вы ничего не выиграли.");
  }

  user.rigged = false;

  saveUsers(users);

  console.log("Данные пользователей после сохранения:", users);
}

module.exports = { handleCaseCommand, handleCaseOpening };
