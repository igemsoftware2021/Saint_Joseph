import path from "path";
import fs from "fs"
import { JSDOM } from "jsdom"
import { WIKI_DIR } from ".";

export function render(filePath: string) {
     const data = fs.readFileSync(filePath).toString()
     const temp: string[] = data.split("{{").flatMap(x => x.split("}}"))
          .map((x, i) => i % 2 !== 0 ? extractHTML(x.split("/")[1].trim()) : x)

     return temp.join("\n")
}

export function extractHTML(templateName: string): string {
     const { window: { document } } = new JSDOM(render(path.join(WIKI_DIR, "Templates", templateName + ".html")))

     return document.body.innerHTML || document.documentElement.innerHTML
}