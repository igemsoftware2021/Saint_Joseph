/**         88 88                      88            88                                           
 *          88 ""                      88            ""                                           
 *          88                         88                                                         
 *  ,adPPYb,88 88 ,adPPYba,  ,adPPYba, 88 ,adPPYYba, 88 88,dPYba,,adPYba,   ,adPPYba, 8b,dPPYba,  
 * a8"    `Y88 88 I8[    "" a8"     "" 88 ""     `Y8 88 88P'   "88"    "8a a8P_____88 88P'   "Y8  
 * 8b       88 88  `"Y8ba,  8b         88 ,adPPPPP88 88 88      88      88 8PP""""""" 88          
 * "8a,   ,d88 88 aa    ]8I "8a,   ,aa 88 88,    ,88 88 88      88      88 "8b,   ,aa 88          
 *  `"8bbdP"Y8 88 `"YbbdP"'  `"Ybbd8"' 88 `"8bbdP"Y8 88 88      88      88  `"Ybbd8"' 88          
 * 
 *   This file still is in development, it partially works, 
 * 
 */
import FormData from "form-data"
import { JSDOM } from "jsdom"
import { CookieJar } from "tough-cookie"
import fetch from "node-fetch"
import { info, success, error } from "./utilities"
import { lstatSync, readdir } from "fs"
import path, { join } from "path"
import fs from "fs"

require("dotenv").config()

const currentYear = new Date().getFullYear()

const form = new FormData()

form.append("username", process.env.LOGIN_USERNAME)
form.append("password", process.env.LOGIN_PASSWORD)
form.append("Login", "Login")

function loadDir(path: string, callback: (file: string) => any) {
     readdir(path, (err, files) => {
          if (err) throw err

          files.forEach(f => {
               if (f === "Templates") return // We will uplaod these from a different place
               else if (lstatSync(join(path, f)).isDirectory()) loadDir(path + "/" + f, callback)
               else if (f.endsWith(".html")) callback(join(path, f))
          })
     })
}

const dir = path.resolve(process.cwd(), process.env.WIKI_DIR)
const templateDir = path.join(dir, "Templates")

let realName = ""

// iGEM has a login chain, we have to follow it, but node-fetch wont store the cookies, so we are gonna do it ourselves

const jar = new CookieJar()

info("Login chain is started");

async function follow(url: string, i: number): Promise<void> {
     info("Following chain to: " + url)

     const res = i == 0 ? await fetch(url, {
          body: form,
          method: "POST",
          headers: {
               ...form.getHeaders(),
               cookie: jar.getCookieStringSync(url)
          },
          redirect: "manual"
     })
          :
          await fetch(url, {
               method: "GET",
               headers: {
                    cookie: jar.getCookieStringSync(url)
               }
          })

     if (url.startsWith("https://parts.igem.org")) realName = new URL(url).searchParams.get("realname")

     res.headers.raw()["set-cookie"]?.forEach(x => jar.setCookieSync(x, url))

     if (res.status == 302) {
          return await follow(res.headers.get("Location"), i + 1)
     } else if (res.status == 200) {
          const { window: { document } } = new JSDOM(await res.text())

          const err = document.getElementById("login_error")

          if (err) return error(`Error: ${err.innerHTML}`)

          success(`Successfully logged in as ${realName}. Starting upload`) // And voilá

          loadDir(dir, async (file) => {

               if (path.basename(file) === "Landing.html") {
                    await uploadFileToServers(file, `Team:${process.env.TEAM_NAME}`)
               } else {
                    const filePath = file.substr(dir.length).replace(/\\/g, "/") // Because windows uses \ as file seperator
                    await uploadFileToServers(file, `Team:${process.env.TEAM_NAME}${filePath.substr(0, filePath.length - 5)}`)
               }
          })
          
          loadDir(templateDir, async (file) => {
               const filePath = file.substr(templateDir.length).replace(/\\/g, "/") // Because windows uses \ as file seperator
               await uploadFileToServers(file, `Template:${process.env.TEAM_NAME}${filePath.substr(0, filePath.length - 5)}`)
          })
          

     }
}


async function uploadFileToServers(filepath: string, igemPath: string) {
     return await fetch(`https://${currentYear}.igem.org/wiki/index.php?title=${igemPath}&action=edit`, {
          headers: {
               cookie: jar.getCookieStringSync(`https://${currentYear}.igem.org/wiki/index.php?title=${igemPath}&action=edit`)
          }
     }).then(async res => {
          const data = await res.text()
          data;
          return
          const { window: { document } } = new JSDOM()
          const form = new FormData()

          Array.from(document.getElementById("editform").children).forEach(x => {
               if (x.tagName === "input" && x.getAttribute("type") === "hidden") {
                    form.append(x.getAttribute("name"), x.getAttribute("value"))
               }
          })

          form.append("wpTextbox1", fs.readFileSync(filepath))
          form.append("wpSummary", "")

          await fetch(`https://${currentYear}.igem.org/wiki/index.php?title=${igemPath}&action=submit`, {
               method: "POST",
               body: form,
               headers: {
                    cookie: jar.getCookieStringSync(`https://${currentYear}.igem.org/wiki/index.php?title=${igemPath}&action=submit`),
                    ...form.getHeaders()
               }
          }).then(() => {
               success(`${path.basename(filepath)} --> ${currentYear}.igem.org/${igemPath}`)
          })
     })
}

follow("https://igem.org/Login2", 0).catch(x => {throw x})