import axios from "axios"
import config from "./config.js"

export async function syncGithub(content){

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

}