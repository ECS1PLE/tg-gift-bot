const { Markup } = require("telegraf");

const mainMenu = Markup.keyboard([["/start", "/balance"], ["/cases"]]).resize();

module.exports = { mainMenu };
