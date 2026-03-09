import "dotenv/config"

import { Telegraf, Markup } from "telegraf"

import config from "./config.js"

import { generateKey, readKeys, saveKeys } from "./keysystem.js"

import { syncGithub } from "./github.js"

const bot = new Telegraf(config.BOT_TOKEN)

function isAdmin(id){

return config.ADMIN_ID.includes(String(id))

}

bot.start((ctx)=>{

ctx.reply(`

KEY SYSTEM PANEL

Developer : @anzzcuki

`,Markup.inlineKeyboard([

[Markup.button.callback("🔑 Generate Key","gen")],

[Markup.button.callback("📋 List Key","list")]

]))

})

bot.action("gen",async(ctx)=>{

if(!isAdmin(ctx.from.id)) return ctx.answerCbQuery("khusus admin")

const key=generateKey()

let keys=readKeys()+"\n"+key

saveKeys(keys)

await syncGithub(keys)

console.log("KEY dibuat oleh:",ctx.from.id,key)

ctx.reply(

`KEY BERHASIL DIBUAT

\`${key}\``,

{

parse_mode:"Markdown",

...Markup.inlineKeyboard([

[Markup.button.callback("📋 Copy Key","copy_"+key)],

[Markup.button.callback("🗑 Hapus Key","del_"+key)]

])

}

)

})

bot.action("list",(ctx)=>{

if(!isAdmin(ctx.from.id)) return

ctx.reply("LIST KEY\n\n"+readKeys())

})

bot.action(/copy_(.+)/,(ctx)=>{

const key=ctx.match[1]

ctx.reply(`KEY ANDA

${key}`)

})

bot.action(/del_(.+)/,async(ctx)=>{

if(!isAdmin(ctx.from.id)) return

const key=ctx.match[1]

let keys=readKeys().split("\n").filter(k=>k!==key)

let result=keys.join("\n")

saveKeys(result)

await syncGithub(result)

ctx.reply("KEY DIHAPUS")

})

bot.launch()

console.log("KEY BOT ACTIVE")