import path from "path";
import fs from "fs"
import Handlebars from "handlebars";
import { info } from "./utilities";
import { JSDOM } from "jsdom";

const templates: {[x: string]: {[x: string]: string }} = { [`Template:${process.env.TEAM_NAME}`]: {} }

export function render(filePath: string) {
     const data = fs.readFileSync(filePath).toString()

     return Handlebars.compile(data, {
          noEscape: true
     })(templates)
}

export function registerTemplate(filePath: string) {
     const data = fs.readFileSync(filePath).toString()
     const base = path.basename(filePath)

     info(`Registered Template:${process.env.TEAM_NAME}/${base.substr(0, base.length - 5)}`)

     templates[`Template:${process.env.TEAM_NAME}`][`${base.substr(0, base.length - 5)}`] = data
}

/**
 * We inject the socket.js at the top of the document
 */
export function inject(html: string) {
     const { window: { document } } = new JSDOM(html)
     const script = document.createElement("script")
     script.src = "/socket.js"
     document.head.appendChild(script)

     return document.documentElement.outerHTML
}