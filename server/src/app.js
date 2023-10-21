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
import { WebSocket, WebSocketServer } from 'ws'
import EventEmitter from "events";
import User from "./models/User.js";
import { createServer } from "http";
import MainChannelQueue from "./models/MainChannelQueue.js";
import serializeVideoQueue from "./services/serializeVideoQueue.js";
const server = createServer(app)

const wss = new WebSocketServer({ server })

//TODO: keep track of video queue time/video finishing, send play next cmd

MainChannelQueue.query().first().then((result) => {
  if (result) {
    channelState.videoDuration = result.duration
  }
})

const channelState = {
  playing: true,
  muted: true,
  seekTimeSeconds: 0,
  timeSeekReceived: new Date(),
  queueMode: true,
  videoDuration: 0,
  videoTimeoutId: null
}

const videoLinkProcessed = new EventEmitter()
videoLinkProcessed.on('videoLinkPostData', (data) => {
  channelState.timeSeekReceived = data.timeSeekReceived
  channelState.seekTimeSeconds = 0
  channelState.queueMode = data.queueMode
})

const getSeekTimeInSeconds = (channelState) => {
  let timeElapsed = (new Date() - channelState.timeSeekReceived) / 1000
  if (!channelState.playing) {
    timeElapsed = 0
  }
  return channelState.seekTimeSeconds + timeElapsed 
}

const advanceQueue = async () => {
  const wholeQueue = await MainChannelQueue.query()
  if (wholeQueue.length > 1) {
    await MainChannelQueue.query().delete().where("id", wholeQueue[0].id)
    const newQueue = serializeVideoQueue(wholeQueue.slice(1))
    const messageObject = {
      type: "videoQueue", 
      content: newQueue
    }
    wss.clients.forEach((client)=> {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageObject))
      }
    })
    // need to set a new timeout, but just calling updateVideoTimeout again leads to recursion
    return newQueue[0].duration
  }
  return null
}

const updateVideoTimeout = (playing) => {
  if (channelState.videoTimeoutId !== null) {
    console.log("clearing old timeout")
    clearTimeout(channelState.videoTimeoutId) // double check this is correct
  }
  if (playing) {
    console.log("the duration of said video", channelState.videoDuration)
    console.log("the seektimes seconds of said video", channelState.seekTimeSeconds)
    const timeoutSeconds = channelState.videoDuration - channelState.seekTimeSeconds
    console.log("timing out in: ", timeoutSeconds, "seconds")
    const id = setTimeout( async () => {
      console.log("timing out")
      const duration = await advanceQueue()
      if (duration !== null) {
        channelState.videoDuration = duration
        channelState.seekTimeSeconds = 0
        channelState.timeSeekReceived = new Date()
      }
    }, timeoutSeconds)
    channelState.videoTimeoutId = id
  }
}

const shouldForwardMessage = async (message) => {
  if (message.type === "seekTime") {
    channelState.seekTimeSeconds = message.content
    channelState.timeSeekReceived = new Date()
    if (channelState.queueMode) {
      updateVideoTimeout(channelState.playing)
    }
    return(true)
  } else if (message.type === "playing") {
    channelState[message.type] = message.content
    channelState.seekTimeSeconds = message.seekTimeSeconds
    channelState.timeSeekReceived = new Date()
    console.log("what is queue mode", channelState.queueMode)
    if (channelState.queueMode) {
      updateVideoTimeout(channelState.playing)
    }
    return(true)
  } else if (message.type === "muted") {
    channelState[message.type] = message.content
    return(true)
  } else if (message.type === "skip") {
    if (channelState.queueMode) {
    const duration = await advanceQueue()
    if (duration !== null) {
      channelState.videoDuration = duration
      channelState.seekTimeSeconds = 0
      channelState.timeSeekReceived = new Date()
    }
      updateVideoTimeout(channelState.playing)
    }
    return(false)
  }
  else {
    return(false)
  }
}

const parseSessionKey = (fullCookie) => {
  if (!fullCookie) {
    return null
  }
  const cookies = fullCookie.split(';')
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('video-battle-session='))
  if (!sessionCookie) {
    return null
  }
  return(sessionCookie.split('=')[1])
}

const sessionToUserEmail = async (sessionKey) => {
  if (sessionKey === null) {
    return "anonymous"
  }
  const sessionContent = Buffer.from(sessionKey, 'base64').toString('utf8')
  const userId = JSON.parse(sessionContent).passport.user
  if (userId === undefined) {
    return "anonymous"
  }
  const userObject = await User.query().findById(userId)
  return userObject.email
}

wss.on('connection', (ws, req) => {
  const sessionKey = parseSessionKey(req.headers.cookie)
  sessionToUserEmail(sessionKey).then( (userEmail) => {
    ws.userEmail = userEmail
  }).then(() => {
    const users = []
    wss.clients.forEach((client) => {
      users.push(client.userEmail)
    })
    const messageUserList = {
      type: "userList",
      content: users
    }
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageUserList))
      }
    })
  })

  const interval = setInterval( () => {
    wss.clients.forEach((client) => {
      client.ping()
    })
  })

  ws.on('close', () => {
    const users = []
    wss.clients.forEach((client) => {
      users.push(client.userEmail)
    })
    const messageUserList = {
      type: "userList",
      content: users
    }
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageUserList))
      }
    })
  })

  const initialState = {
    playing: channelState.playing,
    muted: channelState.muted,
    networkSeekTime: getSeekTimeInSeconds(channelState),
    queueMode: channelState.queueMode
  }
  const messageObject = {
    type: "initial",
    content: initialState
  }
  ws.send(JSON.stringify(messageObject))


  ws.on('message', (blob) => {
    const message = blob.toString('utf8')
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
const port = configuration.web.port
server.listen(configuration.web.port, configuration.web.host, () => {
  console.log(`Server is listening on port ${port}`);
});
export default { app, wss, videoLinkProcessed };