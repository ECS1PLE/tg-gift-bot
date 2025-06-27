const { Markup } = require("telegraf");

const casesMenu = Markup.inlineKeyboard([
  [Markup.button.callback("💝 Сердце (7⭐)", "case_serdce")],
  [Markup.button.callback("🧸 Медведь (7⭐)", "case_medved")],
  [Markup.button.callback("🎁 Подарок (12⭐)", "case_podarok")],
  [Markup.button.callback("🌹 Роза (12⭐)", "case_roza")],
  [Markup.button.callback("🎂 Торт (25⭐)", "case_tort")],
  [Markup.button.callback("💐 Букет (25⭐)", "case_buquet")],
  [Markup.button.callback("🍾 Бутылка (25⭐)", "case_butylka")],
  [Markup.button.callback("🚀 Ракета (25⭐)", "case_raketa")],
  [Markup.button.callback("🏆 Кубок (50⭐)", "case_kubok")],
  [Markup.button.callback("💍 Кольцо (50⭐)", "case_kolco")],
  [Markup.button.callback("💎 Алмаз (50⭐)", "case_almaz")],
  [Markup.button.callback("🍭 Леденец NFT (5⭐)", "case_lollipopNFT")],
]);

module.exports = { casesMenu };
