import express from "express";
import path from "path";
import logger from "morgan";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import "./boot.js";
import configuration from "./config.js";
import addMiddlewares from "./middlewares/addMiddlewares.js";
import rootRouter from "./routes/rootRouter.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
import hbsMiddleware from "express-handlebars";
import WebSocket from 'ws'
import EventEmitter from "events";

const wss = new WebSocket.Server({ port: 8080 })

const channelState = {
  playing: true,
  muted: true,
  seekTimeSeconds: 0,
  timeSeekReceived: new Date()
}

const videoLinkProcessed = new EventEmitter()

videoLinkProcessed.on('videoLinkPostTime', (data) => {
  channelState.timeSeekReceived = data
  seekTimeSeconds = 0
  console.log("video event emission received", data)
})

const getSeekTimeInSeconds = (channelState) => {
  let timeElapsed = (new Date() - channelState.timeSeekReceived) / 1000
  if (!channelState.playing) {
    timeElapsed = 0
  }
  return channelState.seekTimeSeconds + timeElapsed 
}

const shouldForwardMessage = (message) => {
  if (message.type === "seekTime") {
    channelState.seekTimeSeconds = message.content
    channelState.timeSeekReceived = new Date()
    return(true)
  } else if (message.type === "playing") {
    channelState[message.type] = message.content
    channelState.seekTimeSeconds = message.seekTimeSeconds
    channelState.timeSeekReceived = new Date()
    return(true)
  } else if (message.type === "muted") {
    channelState[message.type] = message.content
    return(true)
  }
  else {
    return(false)
  }
}

wss.on('connection', (ws) => {
  const initialState = {
    playing: channelState.playing,
    muted: channelState.muted,
    networkSeekTime: getSeekTimeInSeconds(channelState)
  }
  const messageObject = {
    type: "initial",
    content: initialState
  }
  ws.send(JSON.stringify(messageObject))
  ws.on('message', (message) => {
    const receivedData = JSON.parse(message)
    if (shouldForwardMessage(receivedData)) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  })
})

app.set("views", path.join(__dirname, "../views"));
app.engine(
  "hbs",
  hbsMiddleware({
    defaultLayout: "default",
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
addMiddlewares(app);
app.use(rootRouter);
app.listen(configuration.web.port, configuration.web.host, () => {
  console.log("Server is listening...");
});
export default { app, wss, videoLinkProcessed };