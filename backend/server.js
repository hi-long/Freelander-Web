const express = require('express'),
    app = express(),
    cors = require('cors'),
    http = require('http'),
    flash = require('express-flash'),
    session = require('express-session'),
    db = require('./database');
// db = require('./config/pg');

require('dotenv').config();
app.use(cors());
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(flash());
app.use(session({
    secret: process.env.REACT_APP_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(express.json());

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const users = [];

io.on('connection', socket => {

    socket.on('user-connected', userId => {
        users[userId] = socket.id;
    })

    // MESSENGER CONNECTED: USER ONLINE
    socket.on('messenger-connected', async user => {
        try {
            users[user] = socket.id;
            // Set user online status
            const setOnlineData = await db.query(`
            update users
            set online = true
            where user_id = '${user}'`)
        } catch (err) {
            console.log(err);
        }
    })

    // socket.on('typing-message', message => {
    // })

    // SEND MESSAGE: CREATE NEW MESSAGE, UPDATE CONVERSATION LAST ACTIVE, SEND MES TO RECEIVER, SET RECEIVER UNSEEN
    socket.on('send-message', async message => {
        try {
            const time = new Date();
            const newMessage = {
                conversation_id: message.conversation_id,
                content: message.content,
                created_at: time,
                owner: message.userId
            };
            const newMessageQuery = `insert into message set ? `
            const newMessageData = await db.query(newMessageQuery, [newMessage]);
            console.log(newMessageData)
            // update conversation set last_active = '2020-12-09 21:41:59' where conversation_id = '5e9acf67-e9';
            const updateLastActiveQuery = `update conversation set last_active = (select now()) where conversation_id = '${message.conversation_id}' `;
            const updateLastActiveData = await db.query(updateLastActiveQuery)
            const updateReceiverUnseen = await db.query(`
                update userconversation 
                set seen = false
                where conversation_id = '${message.conversation_id}' and user_id = '${message.to}'
            `)
            let socketId = users[message.to];
            message.type = 'receive';
            message.cover = message.cover;
            message.name = message.toName;
            console.log(message)
            io.to(socketId).emit('receive-message', message);
        } catch (err) {
            console.log('send message', err)
        }

        // ON SEEN MESSAGE: UPDATE CONVERSATION SEEN OF THE RECEIVER
    })

    socket.on('seen-message', async conversation => {
        try {
            const updateConversationSeenQuery = `
                    update userconversation
                    set seen = true
                    where conversation_id = '${conversation.conversation_id}' and user_id = '${conversation.user_id}'`;
            const updatedConversation = await db.query(updateConversationSeenQuery);
        } catch (err) {
            console.log(err);
        }
    })

    socket.on('disconnect', async () => {
        try {
            let disconnectedUserId;
            // Get disconnected user
            for (let userId in users) {
                const userSocketId = users[userId];
                if (userSocketId === socket.id) {
                    disconnectedUserId = userId;
                    break;
                }
            }
            // Update user last active 
            const updateUserLastActiveQuery = `
            update users 
            set 
                last_active = (select now()),
                online = false
            where user_id = '${disconnectedUserId}'`;
            const updateUserLastActiveData = await db.query(updateUserLastActiveQuery);

        } catch (err) {
            console.log(err);
        }
    })
})

const authentication = require('./routes/authentication');
const notification = require('./routes/notification');
const images = require('./routes/images');
const user = require('./routes/user');
const service = require('./routes/service');
const review = require('./routes/review');
const messenger = require('./routes/messenger');
const keyword = require('./routes/keyword');
const searching = require('./routes/searching');
const recentlyView = require('./routes/recentlyView');
const savedList = require('./routes/savedList');

app.use(authentication);
app.use(images);
app.use(keyword);
app.use(searching);
app.use(messenger);
app.use(review);
app.use(service);
app.use(notification);
app.use(recentlyView);
app.use(savedList);
app.use(user);

server.listen(process.env.PORT || 5000, () => {
    console.log('The app is onnnnn :DD')
})

