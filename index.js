import { Telegraf, Markup } from "telegraf";
import fs from "fs-extra";
import config from "./config.js";
import fetch from "node-fetch";

const bot = new Telegraf(config.BOT_TOKEN);
const JSON_FILE = "./keys.json";
const TXT_FILE = "./keys.txt";

// Load keys lokal
let keys = [];
if (fs.existsSync(JSON_FILE)) {
  keys = fs.readJSONSync(JSON_FILE);
}

// Generate key format Python
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

// Simpan key lokal
function saveKey(key) {
  keys.push({ key, created_at: new Date().toISOString() });
  fs.writeJSONSync(JSON_FILE, keys, { spaces: 2 });
  fs.appendFileSync(TXT_FILE, key + "\n");
}

// Push key ke GitHub
async function pushKeyToGitHub(key) {
  const GITHUB_FILE_PATH = "keys.txt";
  const message = `Add new key ${key}`;
  const apiUrl = `https://api.github.com/repos/${config.GITHUB_USER}/${config.GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

  // Ambil sha kalau file sudah ada
  let sha;
  const resGet = await fetch(apiUrl, {
    headers: { Authorization: `token ${config.GITHUB_TOKEN}`, "User-Agent": "node.js" }
  });

  let content = key + "\n";
  if (resGet.status === 200) {
    const data = await resGet.json();
    sha = data.sha;
    const existing = Buffer.from(data.content, "base64").toString("utf8");
    content = existing + key + "\n";
  }

  await fetch(apiUrl, {
    method: "PUT",
    headers: { Authorization: `token ${config.GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha
    })
  });
}

// Start bot
bot.start((ctx) => {
  ctx.replyWithPhoto(config.START_PHOTO, {
    caption: `👋 Halo ${ctx.from.first_name}!\n\nDeveloper: @dho_strr\nSupport : @anzzcuki`,
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🔑 Generate Key", "GENERATE")],
      [Markup.button.callback("📄 List Key", "LIST")],
      [Markup.button.callback("ℹ️ Info Developer/Support", "INFO")]
    ])
  });
});

// Button actions
bot.action("GENERATE", async (ctx) => {
  const key = generateKey();
  saveKey(key);
  await pushKeyToGitHub(key); // otomatis push ke GitHub
  await ctx.answerCbQuery();
  await ctx.reply(`✅ Key Baru Generated & Diupload ke GitHub:\n${key}\n\nDeveloper: @dho_strr\nSupport: @anzzcuki`);
});

bot.action("LIST", async (ctx) => {
  await ctx.answerCbQuery();
  if (!keys.length) return ctx.reply("❌ Belum ada key tersimpan.");
  const listKeys = keys.map((k, i) => `${i + 1}. ${k.key}`).join("\n");
  await ctx.reply(`📄 List Key:\n${listKeys}\n\nDeveloper: @dho_strr\nSupport: @anzzcuki`);
});

bot.action("INFO", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`ℹ️ Developer: @dho_strr\nℹ️ Support: @anzzcuki\nGunakan tombol 🔑 untuk generate key baru atau 📄 untuk lihat key.`);
});

// Launch bot
bot.launch();
console.log("🤖 Key Generator Bot running with GitHub push + Buttons...");
