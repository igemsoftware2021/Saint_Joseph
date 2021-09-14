require("dotenv").config()
import ws from "ws"
import fs from "fs"
import express from "express"
import path from "path"
import { inject, registerTemplate, render } from "./compiler"
import { info, success } from "./utilities"

export let { TEAM_NAME, WIKI_DIR, PORT } = process.env

PORT = PORT || "5050"

const app = express()

const httpServer = app.listen(parseInt(PORT))

const server = new ws.Server({ server: httpServer })

WIKI_DIR = path.resolve(process.cwd(), process.env.WIKI_DIR)

app.get("*", (req, res, next) => {
	if (req.path == `/Team:${TEAM_NAME}/`) {
		res.type("html").send(inject(render(path.join(WIKI_DIR, "Landing.html"))))
	} else if (req.path.startsWith(`/Team:${TEAM_NAME}`) && fs.existsSync(path.join(WIKI_DIR, req.path.substr(6 + TEAM_NAME.length) + ".html"))) {
		res.type("html").send(inject(render(path.join(WIKI_DIR, req.path.substr(6 + TEAM_NAME.length) + ".html"))))
	} else if (req.query?.action === "raw") {
		res.type(req.query.ctype as string || "text/html").send(fs.readFileSync(path.join(WIKI_DIR, req.path.substr(6 + TEAM_NAME.length) + ".html")))
	}
	else next()
})

app.use(`/Team:${TEAM_NAME}`, express.static(WIKI_DIR))

app.get("/socket.js", (req, res) => {
	res.sendFile(path.join(__dirname, "../socket.js"))
})


fs.readdirSync(path.join(WIKI_DIR, "Templates")).forEach(x => registerTemplate(path.join(WIKI_DIR, "Templates", x)))

fs.watch(WIKI_DIR, { recursive: true }, (event, file) => {
	if (event === "change" || event === "rename") {
		info("Changes detected on files")
		if (path.dirname(file.toString()) === "Templates") registerTemplate(path.join(WIKI_DIR, file.toString()))
		server.clients.forEach(x => x.send(1))
	}
})

success(`Site is ready on: http://localhost:${PORT}/Team:${TEAM_NAME}`)