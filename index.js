import { Telegraf, Markup } from "telegraf";
import fs from "fs-extra";
import config from "./config.js";

const bot = new Telegraf(config.BOT_TOKEN);
const JSON_FILE = "./keys.json";
const TXT_FILE = "./keys.txt";

// Load keys
let keys = [];
if (fs.existsSync(JSON_FILE)) {
  keys = fs.readJSONSync(JSON_FILE);
}

// Generate key sesuai format Python
function generateKey() {
  const part = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let str = "";
    for (let i = 0; i < 4; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  };
  return `${config.KEY_PREFIX}-${part()}-${part()}-${part()}`;
}

// Save key ke JSON & TXT
function saveKey(key) {
  keys.push({ key, created_at: new Date().toISOString() });
  fs.writeJSONSync(JSON_FILE, keys, { spaces: 2 });
  fs.appendFileSync(TXT_FILE, key + "\n");
}

// Start
bot.start((ctx) => {
  ctx.replyWithPhoto(config.START_PHOTO, {
    caption: `👋 Halo ${ctx.from.first_name}!\n\nDeveloper: @dho_strr\nSupport : @anzzcuki`,
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🔑 Generate 1 Key", "GEN_1")],
      [Markup.button.callback("🔑 Generate 5 Key", "GEN_5")],
      [Markup.button.callback("📄 List Key", "LIST")],
      [Markup.button.callback("ℹ️ Info Developer/Support", "INFO")]
    ])
  });
});

// Button actions
bot.action(/GEN_(\d+)/, (ctx) => {
  const amount = parseInt(ctx.match[1]);
  const newKeys = [];
  for (let i = 0; i < amount; i++) {
    const k = generateKey();
    saveKey(k);
    newKeys.push(k);
  }
  ctx.answerCbQuery();
  ctx.reply(`✅ Generated ${newKeys.length} key(s):\n${newKeys.join("\n")}\n\nDeveloper: @dho_strr\nSupport: @anzzcuki`);
});

bot.action("LIST", (ctx) => {
  ctx.answerCbQuery();
  if (!keys.length) return ctx.reply("❌ Belum ada key tersimpan.");
  const listKeys = keys.map((k, i) => `${i + 1}. ${k.key}`).join("\n");
  ctx.reply(`📄 List Key:\n${listKeys}\n\nDeveloper: @dho_strr\nSupport: @anzzcuki`);
});

bot.action("INFO", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(`ℹ️ Developer: @dho_strr\nℹ️ Support: @anzzcuki\nGunakan tombol 🔑 untuk generate key baru atau 📄 untuk lihat key.`);
});

// Launch bot
bot.launch();
console.log("🤖 Key Generator Bot running with full button + Python compatible key format...");
