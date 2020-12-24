import React, { Component, Fragment } from 'react';
import * as styles from './Messenger.module.css';

import io from 'socket.io-client';

import Navbar from '../../components/Navbar/Navbar';
import BoxChat from '../../components/Message/ConversationList/BoxChat';
import Message from '../../components/Message/Message/Message';
import Input from '../../components/UI/Input/Input';
import axios from '../../axios-baseURL';
import * as timeago from 'timeago.js';
import OnlineStatus from '../../components/OnlineStatus/OnlineStatus';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';

let socket;

class Messenger extends Component {
    constructor(props) {
        super(props);
        this.conversationDiv = React.createRef();

    }
    state = {
        conversations: [],
        userNotifications: [],

        chatting: {
            to: '',
            name: '',
            last_active: '',
            online: '',
            typingMes: '',
            conversation: '',
            cover: ''
        },
        limit: 0,
        messages: [],
        onScroll: false,
        ENDPOINT: `localhost:5000`,
        // ENDPOINT: `https://freelander-web.herokuapp.com/`,
        conversationLoading: false,
        messageLoading: false
    }

    componentDidMount = async () => {
        try {
            const userId = this.props.userId;
            this.scrollToBottom();

            const conversationsData = await axios.get(`/${userId}/messenger`);
            const firstConversation = conversationsData.data.conversations[0];
            const messagesOfFirstConversation = await axios.get(`/${userId}/messenger/${firstConversation.conversation.conversation_id}?limit=${this.state.limit}`);

            const userNotifications = await axios.get(`/${userId}/notifications`);

            this.setState({
                messages: [].concat(messagesOfFirstConversation.data.messages.reverse()),
                chatting: {
                    ...this.state.chatting,
                    conversation: firstConversation.conversation.conversation_id,
                    to: firstConversation.to.user_id,
                    name: firstConversation.to.name,
                    cover: firstConversation.to.cover,
                    online: firstConversation.to.online,
                    last_active: firstConversation.to.last_online
                },
                conversations: this.state.conversations.concat(conversationsData.data.conversations),
                userNotifications: userNotifications.data
            })

            // SOCKET INIT
            socket = io(this.state.ENDPOINT);

            // Get all receivers
            socket.emit('messenger-connected', userId);

            this.onReceivingMessage();
            this.scrollToBottom();
        } catch (err) {
            console.log(err);
        }
    }

    onEnterConversation = async (conversation) => {
        try {
            this.setState({
                conversationLoading: true
            })
            const conversationId = conversation.conversation_id;
            const userName = conversation.name;
            const userOnline = conversation.online;
            const userLastActive = conversation.last_active;
            const userCover = conversation.cover;
            if (conversationId !== this.state.chatting.conversation) {
                const newConversationData = await axios.get(`/${localStorage.getItem('userId')}/messenger/${conversationId}?limit=0`);

                this.setState({
                    messages: [].concat(newConversationData.data.messages.reverse()),
                    chatting: {
                        ...this.state.chatting,
                        conversation: conversationId,
                        online: userOnline,
                        last_active: userLastActive,
                        name: userName,
                        cover: userCover
                    },
                    conversationLoading: false
                })
                this.props.history.push(this.props.match.url + `/${conversationId}`);
                this.scrollToBottom();
            }
        } catch (err) {
            console.log(err);
        }
    }

    onTypingMessage = event => {
        socket.emit('typing-message', this.state.chatting.typingMes);
        this.setState({
            chatting: {
                ...this.state.chatting,
                typingMes: event.target.value
            }
        })
    }

    onSendMessage = event => {
        event.preventDefault();
        if (this.state.chatting.typingMes !== '') {
            const userId = this.props.userId;
            const conversation_id = this.state.chatting.conversation;
            const conversation_content = this.state.chatting.typingMes;

            const newConversationList = this.pushUpdatedConversationOnTop(conversation_id);

            this.setState({
                conversations: newConversationList
            })

            const message = {
                conversation_id: conversation_id,
                to: this.state.chatting.to,
                toName: this.state.chatting.name,
                toCover: this.state.chatting.cover,
                type: 'me',
                cover: this.props.userCover,
                name: 'Me',
                content: conversation_content
            }

            const updatedConversationsList = this.updateLastActiveConversation(conversation_id, conversation_content, new Date());

            console.log({ userId, ...message })
            socket.emit('send-message', { userId, ...message });
            this.setState({
                // conversations: updatedConversationsList,
                messages: this.state.messages.concat(message),
                chatting: {
                    ...this.state.chatting,
                    typingMes: ''
                },
            })
            this.scrollToBottom();
        }
    }

    onReceivingMessage = () => {
        socket.on('receive-message', message => {
            const conversation_id = message.conversation_id;

            if (this.state.chatting.conversation === message.conversation_id) {

                const newConversationList = this.pushUpdatedConversationOnTop(conversation_id);
                newConversationList[0].conversation.seen = 0;
                newConversationList[0].conversation.last_message = message.content;

                this.setState({
                    conversations: newConversationList,
                    messages: this.state.messages.concat(message),
                    chatting: {
                        ...this.state.chatting,
                        online: true
                    }
                })
            }
        })
    }

    onConversationSeen = conversation_id => {
        const userId = this.props.userId;
        const conversationSeen = { conversation_id: conversation_id, user_id: userId };
        console.log(conversationSeen)
        socket.emit('seen-message', conversationSeen);
        const receivingConversation = this.state.conversations.find(conversation => conversation.conversation.conversation_id === conversation_id);

        receivingConversation.conversation.seen = 1;

        this.scrollToBottom();
    }

    onLoadMoreMessages = async (event) => {
        try {
            this.setState({
                messageLoading: true
            })
            const userId = this.props.userId;
            const scrollTop = this.conversationDiv.current.scrollTop;
            if (scrollTop === 0) {
                const loadedMessages = await axios.get(`/${userId}/messenger/${this.state.chatting.conversation}?limit=${this.state.limit + 1}`)
                this.setState({
                    messages: loadedMessages.data.messages.reverse().concat(this.state.messages),
                    limit: this.state.limit + 1,
                    messageLoading: false
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    onToBottomButtonShowing = () => {
        const scrollTop = this.conversationDiv.current.scrollTop;
        const scrollHeight = this.conversationDiv.current.scrollHeight;
        this.setState({
            onScroll: scrollHeight - scrollTop > 420
        })
    }

    pushUpdatedConversationOnTop = conversation_id => {
        this.scrollToBottom();
        const otherConversations = this.state.conversations.filter(conversation => conversation.conversation.conversation_id !== conversation_id);
        const receivingConversation = this.state.conversations.find(conversation => conversation.conversation.conversation_id === conversation_id);
        return [receivingConversation, ...otherConversations];
    }

    updateLastActiveConversation = (conversation_id, last_message, last_active) => {
        const updatedConversation = this.state.conversations.find(conversation => conversation.conversation.conversation_id === conversation_id);

        updatedConversation.conversation.last_message = last_message;
        updatedConversation.conversation.last_active = last_active;

        return updatedConversation;
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    render() {
        return (
            <Fragment>
                <section className={styles['navbar']}>
                    <Navbar
                        active='Messenger'
                        onUserRoleSwitch={this.props.onUserRoleSwitch}
                        notifications={this.state.userNotifications}></Navbar>
                </section>
                <section className={styles['main']}>
                    <section className={styles['header']}>
                        <div className={styles['header__conversation']}>
                            <h4>All conversation</h4>
                            <img alt='' src={process.env.PUBLIC_URL + '/images/Message/search.png'}></img>
                        </div>
                        <div className={styles['header_user']}>
                            <OnlineStatus
                                customStyle='header-user'
                                status={this.state.chatting.online}></OnlineStatus>
                            <h2 className={styles[this.state.chatting.online === 0 ? 'offline' : '']}>{this.state.chatting.name}</h2>
                        </div>
                    </section>
                    <section className={styles['content-wrapper']}>
                        <div className={styles['conversation-list']}>
                            {this.state.conversations.map((conversation, key) => <BoxChat
                                key={key}
                                // seen={conversation.conversation.seen}
                                selected={conversation.conversation.conversation_id === this.state.chatting.conversation}
                                onEnterConversation={this.onEnterConversation}
                                {...conversation}
                                onConversationSeen={this.onConversationSeen}></BoxChat>)}

                        </div>
                        <div
                            className={styles['conversation']}
                            onClick={() => this.onConversationSeen(this.state.chatting.conversation)}>
                            <div
                                ref={this.conversationDiv}
                                className={styles['conversation-wrapper']}
                                onScroll={() => { this.onLoadMoreMessages(); this.onToBottomButtonShowing() }}>
                                <div
                                    className={styles['messages']}>
                                    {this.state.messages.map((message, key) => <Message key={key} status={this.state.chatting.online} {...message}></Message>)}
                                </div>
                                {/* {this.state.onScroll && <div className={styles['scrollToBottom']}>
                                    <img
                                        onClick={this.scrollToBottom}
                                        alt='' src={process.env.PUBLIC_URL + '/images/Message/toBottom.png'}></img>
                                </div>} */}
                                <div style={{ float: "left", clear: "both" }}
                                    ref={(el) => { this.messagesEnd = el; }} />
                            </div>
                            <div className={styles['input']}>
                                <form onSubmit={event => this.onSendMessage(event)}>
                                    <Input
                                        customStyle='messenger-input'
                                        elementType='input'
                                        elementConfig={{
                                            type: 'text',
                                            placeholder: 'Type something ...'
                                        }}
                                        value={this.state.chatting.typingMes}
                                        changed={event => this.onTypingMessage(event)}
                                    ></Input>
                                    <Input customStyle='send-message' elementType='submit'></Input>
                                </form>
                            </div>
                        </div>
                        <section className={styles['receiver-container']}>
                            <div className={styles['receiver']}>
                                <img alt='' src={this.state.chatting.cover}></img>
                                <Link to={`/${this.state.chatting.to}`}>
                                    <h3 className={styles[this.state.chatting.online === 0 ? 'offline' : '']}>{this.state.chatting.name}</h3>
                                </Link>
                                {this.state.chatting.online === 0 && <h5>Last active {timeago.format(this.state.chatting.last_active)}</h5>}
                            </div>
                        </section>
                    </section>
                </section>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userCover: state.authReducer.cover,
        authCompShowing: state.authReducer.authCompToggle,
        searchKeywords: state.otherReducer.searchKeywords,
        onServiceDetails: state.otherReducer.onServiceDetails
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSearching: (searchKeywords) => dispatch(actions.onSearching(searchKeywords)),
        authCompToggle: (onAuth) => dispatch(actions.authCompToggle(onAuth)),
        onUserRoleSwitch: () => dispatch(actions.onUserRoleSwitch())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Messenger);

