import "dotenv/config"
import { Telegraf, Markup } from "telegraf"
import config from "./config.js"
import fs from "fs"
import axios from "axios"

const bot = new Telegraf(config.BOT_TOKEN)

if(!fs.existsSync("keys.txt")){
fs.writeFileSync("keys.txt","")
}

function isAdmin(id){
return config.ADMIN_ID.includes(String(id))
}

function generateKey(){

const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

let key="IB-"

for(let i=0;i<16;i++){

key+=chars[Math.floor(Math.random()*chars.length)]

}

return key
}

function readKeys(){

return fs.readFileSync("keys.txt","utf8")

}

function saveKeys(data){

fs.writeFileSync("keys.txt",data)

}

async function syncGithub(content){

try{

const url=`https://api.github.com/repos/${config.REPO_OWNER}/${config.REPO_NAME}/contents/${config.FILE_PATH}`

let sha=null

try{

const res=await axios.get(url,{
headers:{Authorization:`token ${config.GITHUB_TOKEN}`}
})

sha=res.data.sha

}catch{}

await axios.put(url,{
message:"update keys",
content:Buffer.from(content).toString("base64"),
sha:sha
},{
headers:{Authorization:`token ${config.GITHUB_TOKEN}`}
})

console.log("SYNC GITHUB BERHASIL")

}catch(e){

console.log("SYNC GITHUB ERROR",e.message)

}

}

bot.start((ctx)=>{

ctx.reply(

`KEY SYSTEM PANEL

Developer : @dho_strr
Suport    : @anzzcuki

Klik tombol di bawah`,

Markup.inlineKeyboard([

[Markup.button.callback("🔑 Generate Key","gen")],
[Markup.button.callback("📋 List Key","list")]

])

)

})

bot.action("gen",async(ctx)=>{

if(!isAdmin(ctx.from.id)) return ctx.answerCbQuery("khusus admin")

const key=generateKey()

let keys=readKeys()

if(keys.length>0) keys+="\n"

keys+=key

saveKeys(keys)

await syncGithub(keys)

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

console.log("BOT KEY SYSTEM AKTIF")
