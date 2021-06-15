import ws from "ws"
import fs from "fs"
import express from "express"
import path from "path"
import { render } from "./compiler"
import { JSDOM } from "jsdom"

require("dotenv").config()

export let { TEAM_NAME, WIKI_DIR, PORT } = process.env

PORT = PORT || 5050

const app = express()

const httpServer = app.listen()

const server = new ws.Server({ server: httpServer })

WIKI_DIR = path.resolve(process.cwd(), "../igem-wiki")

app.use(`/Team:${TEAM_NAME}`, express.static(WIKI_DIR))

app.get("*", (req, res, next) => {
	if (req.path == `/Team:${TEAM_NAME}`) {
			const { window: { document } } = new JSDOM(render(path.join(WIKI_DIR, "Landing.html")))
			const script = document.createElement("script")
			script.src = "/socket.js"
			document.head.appendChild(script)
			res.type("html").send(document.documentElement.outerHTML)
	} else if (req.path.startsWith(`/Team:${TEAM_NAME}`) && fs.existsSync(path.join(WIKI_DIR, req.path.substr(18) + ".html"))) {
			const { window: { document } } = new JSDOM(render(path.join(WIKI_DIR, req.path.substr(18) + ".html")))
			const script = document.createElement("script")
			script.src = "/socket.js"
			document.head.appendChild(script)
			res.type("html").send(document.documentElement.outerHTML)
	} else next()
})

app.get("/socket.js", (req, res) => {
	res.sendFile(path.join(__dirname, "../socket.js"))
})

fs.watch(WIKI_DIR).on("change", (event, file) => {
	if (event === "change" || event === "rename") {
		server.clients.forEach(x => x.send(1))
	}
})

console.log(`http://localhost:${PORT}/Team:${TEAM_NAME}`)