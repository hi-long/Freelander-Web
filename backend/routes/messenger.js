const express = require('express'),
    router = express.Router(),
    db = require('../database'),
    // db = require('../config/pg'),
    { v4: uuidv4 } = require('uuid');

router.get('/:id/messenger/:conversation', async (req, res, next) => {
    try {
        const { id, conversation } = req.params;
        const limit = req.query['limit'];
        const messagesQuery = `
        select content, created_at, owner, name, cover
        from message
        join users on (message.owner = users.user_id)
        where conversation_id = '${conversation}'
        order by created_at desc
        limit ${limit * 6}, 6`;
        const messagesData = await db.query(messagesQuery);
        for (let messageData of messagesData) {
            if (messageData.owner === id) {
                messageData.type = 'me';
                messageData.name = 'Me';
            }
        }
        res.json({
            state: 'success',
            messages: messagesData
        })
    } catch (err) {
        console.log(err)
        res.json({
            state: 'fail',
            message: 'Something wrong happen, please try later :( '
        })
    }
})

router.get('/:id/messenger', async (req, res, next) => {
    try {
        const userId = req.params.id;

        const conversationQuery = `
        WITH ranked_messages AS (
        SELECT m.*, ROW_NUMBER() OVER (PARTITION BY conversation_id, user_id ORDER BY last_active DESC) AS rn
        FROM (select conversation.*, content, user_id, seen, cover, name, users.last_active as last_online, online
            from conversation
            join userconversation using (conversation_id)
            join users using (user_id)
            join message using (conversation_id) 
            where conversation_id in (select conversation_id
						from userconversation
						where user_id = '${userId}') 
	    and user_id != '${userId}'
            order by last_active desc) AS m
        )
        SELECT * FROM ranked_messages WHERE rn = 1;`

        const conversationData = await db.query(conversationQuery);
        const conversationTo = conversationData.map(conversation => ({
            conversation: {
                conversation_id: conversation.conversation_id,
                last_active: conversation.last_active,
                last_message: conversation.content,
                seen: conversation.seen
            },
            to: {
                user_id: conversation.user_id,
                cover: conversation.cover,
                name: conversation.name,
                last_online: conversation.last_online,
                online: conversation.online
            }
        }));

        res.json({
            status: 'success',
            conversations: conversationTo
        })
    } catch (err) {
        console.log(err);
    }
})

router.post('/:id/messenger/new', async (req, res, next) => {
    try {
        const { from_id, to_id, init_service, contact_message } = req.body;
        const checkConversationExistQuery = `
        select * 
        from userconversation 
        where conversation_id in 
        (select conversation_id
        from userconversation 
        where user_id = '${from_id}') and user_id = '${to_id}'`;
        const checkConversationExistData = await db.query(checkConversationExistQuery);

        const contactMessage = {
            content: contact_message,
            created_at: new Date(),
            owner: from_id
        }
        if (checkConversationExistData.length === 0) {
            const newConversation = {
                conversation_id: uuidv4().substring(0, 11),
                init_service: init_service,
                last_active: new Date()
            }
            contactMessage.conversation_id = newConversation.conversation_id;

            // from_id: from_id,
            // to_id: to_id,
            const newConversationQuery = `insert into conversation set ?`;
            const newConversationData = await db.query(newConversationQuery, [newConversation]);
            const newUserConversationQuery = `insert into userconversation set ?`
            const newFromConversation = await db.query(newUserConversationQuery, [{ user_id: from_id, conversation_id: newConversation.conversation_id, seen: true }]);
            const newToConversation = await db.query(newUserConversationQuery, [{ user_id: to_id, conversation_id: newConversation.conversation_id, seen: false }]);
        } else {
            contactMessage.conversation_id = checkConversationExistData[0].conversation_id;
        }
        const contactMessageQuery = `insert into message set ?`
        const contactMessageData = await db.query(contactMessageQuery, contactMessage);

        res.json({ status: 'failed', message: 'Conversation existed' })
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;
