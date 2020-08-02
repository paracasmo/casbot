const path = require('path')
const winston = require("winston")
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.cli(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
    ),
    transports: [new winston.transports.Console()],
})

const FileSync = require("lowdb/adapters/FileSync");
const db = require("lowdb")(new FileSync("db.json"))

const express = require('express')
const app = express()
const port = 3000

logger.warn("LIT")
logger.info("HUA")
logger.error("NIA")

// Set some defaults (required if your JSON file is empty)
db.defaults({ commands: [] }).write()
db.set("commands", []).write()
db.get("commands").push({ id: "coolCommand1" }).write()
logger.info(`db contents: ${db.get("commands").map("id").value()}`)

app.use(express.static(path.join(__dirname, 'web')))

app.listen(port, () => console.log(`Listening at http://localhost:${port}`)
)