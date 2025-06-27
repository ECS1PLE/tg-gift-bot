const fs = require("fs");
const path = require("path");

const prizesFilePath = path.join(__dirname, "../data/prizes.json");

function loadPrizes() {
  try {
    if (!fs.existsSync(prizesFilePath)) {
      console.log("Файл с призами не найден");
      return [];
    }

    const data = fs.readFileSync(prizesFilePath, "utf-8");

    if (!data) {
      console.log("Файл с призами пуст");
      return [];
    }

    const prizes = JSON.parse(data);

    if (!Array.isArray(prizes)) {
      console.log("Данные в файле не являются массивом");
      return [];
    }

    return prizes;
  } catch (error) {
    console.error("Ошибка при загрузке списка призов:", error);
    return [];
  }
}

function clearPrizes() {
  try {
    const emptyArray = [];
    fs.writeFileSync(
      prizesFilePath,
      JSON.stringify(emptyArray, null, 2),
      "utf-8"
    );
    console.log("Список призов успешно очищен.");
  } catch (error) {
    console.error("Ошибка при очистке списка призов:", error);
  }
}

module.exports = { loadPrizes, clearPrizes };
