import express from 'express';
import { config } from 'dotenv';
import { dbConnect } from './db/dbconnection.js';
import userRouter from './routes/user-route.js';
import chatRouter from './routes/chat-route.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { createServer } from 'http';
import User from './models/user-model.js';
import * as path from 'path';

config();
const app = express();
const server = createServer(app);

const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['POST', 'GET', 'UPDATE', 'DELETE', 'PUT', 'PATCH'],
};

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT} 🤘🏻`);
});

// const __dirname = path.resolve();

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, "/client/build")))
  
//   app.get('/', (req, res) => {
//     res.sendFile(path.resolve(__dirname,"client","build","index.html"))
//   })
// } else {
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello from server 😊' });
  // }
  });
// }

dbConnect().then(() => {
  console.log('successfully connected to MongoDB database 👍🏻');
});

app.use('/user', userRouter);
app.use('/chat', chatRouter);

const io = new Server(server, { cors: corsOptions });

io.on('connection', (socket) => {
  socket.on('send_message', (data) => {
    saveChats(data.message.role, data.message.content, data.user);
  });
  socket.on('received_message', (data) => {
    saveChats(data.message.role, data.message.content, data.user);
  });
});

const saveChats = async (role, content, user) => {
  try {
    const updatedUser = await User.updateOne(
      { _id: user },
      { $addToSet: { chats: { role, content } } }
    );
  } catch (error) {
    console.error(error);
  }
};
