import { Telegraf } from "telegraf"
import axios from "axios"
import config from "./config.js"

const bot = new Telegraf(config.BOT_TOKEN)

function generateKey(){
const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function part(){
let s=""
for(let i=0;i<4;i++){
s+=chars[Math.floor(Math.random()*chars.length)]
}
return s
}

return `${config.KEY_PREFIX}-${part()}-${part()}`
}

async function addKeyGithub(key){

const url=`https://api.github.com/repos/${config.GITHUB_USER}/${config.GITHUB_REPO}/contents/keys.txt`

const res=await axios.get(url,{
headers:{Authorization:`token ${config.GITHUB_TOKEN}`}
})

const file=Buffer.from(res.data.content,"base64").toString()

const updated=file+"\n"+key

await axios.put(url,{
message:"add key",
content:Buffer.from(updated).toString("base64"),
sha:res.data.sha
},{
headers:{Authorization:`token ${config.GITHUB_TOKEN}`}
})

}

bot.start(ctx=>{
ctx.reply("Bot Key Generator Aktif")
})

bot.command("createkey",async(ctx)=>{

if(ctx.from.id!=config.OWNER_ID)
return ctx.reply("Bukan owner")

const key=generateKey()

await addKeyGithub(key)

ctx.reply(`Key berhasil dibuat:\n\n${key}`)
})

bot.launch()

console.log("Bot running")
