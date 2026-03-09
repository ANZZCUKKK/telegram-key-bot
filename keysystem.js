import fs from "fs"

export function generateKey(){

const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

let key="IB-"

for(let i=0;i<16;i++){

key+=chars[Math.floor(Math.random()*chars.length)]

}

return key

}

export function readKeys(){

if(!fs.existsSync("keys.txt")) fs.writeFileSync("keys.txt","")

return fs.readFileSync("keys.txt","utf8")

}

export function saveKeys(data){

fs.writeFileSync("keys.txt",data)

}