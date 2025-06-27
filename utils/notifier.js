const fs = require("fs");
const path = "./data/prizes.json";

function sendAdminNotification(user, prize) {
  const prizeNotification = {
    userId: user.id,
    userName: user.tag || "Неизвестный",
    prize,
    date: new Date().toISOString(),
  };

  let prizes = [];
  try {
    if (fs.existsSync(path)) {
      prizes = JSON.parse(fs.readFileSync(path, "utf8"));
      console.log("Призы загружены из файла: ", prizes);
    } else {
      console.log("Файл prizes.json не найден, создаем новый файл.");
    }
    if (!Array.isArray(prizes)) {
      prizes = [];
    }
  } catch (error) {
    console.error(
      "Ошибка при чтении или парсинге файла prizes.json:",
      error.message
    );
    prizes = [];
  }

  prizes.push(prizeNotification);

  try {
    fs.writeFileSync(path, JSON.stringify(prizes, null, 2));
    console.log("Выигрыш добавлен в файл prizes.json.");
  } catch (error) {
    console.error("Ошибка записи в файл prizes.json:", error.message);
  }
}

module.exports = { sendAdminNotification };
