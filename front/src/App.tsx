import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import {
    makeStyles,
    createStyles,
    Theme,
    TextField,
    IconButton,
    Grid,
    Paper
} from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';
import useStateRef from 'react-usestateref';

const SERVER_URL = 'http://192.168.1.29:3001';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
            height: '100%',
            maxWidth: 1000,
            margin: '0 auto'
        },
        paper: {
            padding: theme.spacing(1),
            marginBottom: theme.spacing(2),
        },
        userMessage: {
            backgroundColor: '#cdeccd',
            float: 'right',
            clear: 'both',
            maxWidth: '80%',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '10px',
        },
        botMessage: {
            backgroundColor: '#f0f0f0',
            float: 'left',
            clear: 'both',
            maxWidth: '80%',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '10px',
            whiteSpace: 'pre-wrap'
        },
        input: {
            width: '100%',
        },
        inputField: {
            display: "flex",
            flexDirection: "row",
            alignItems: 'center',
            position: 'sticky',
            bottom: 0,
            width: '100%',
            maxWidth: 1000,
            zIndex: 999,
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '10px',
        }
    })
);

interface IMessage {
    id: number;
    role: string;
    content: string;
}

const ChatBot: React.FC = () => {
    const classes = useStyles();
    const [message, setMessage] = useState('');
    const [messages, setMessages, messagesRef] = useStateRef<IMessage[]>([]);
    const messagesEndRef = useRef(null);
    const inputFieldRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // @ts-ignore
            messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
        }
    }

    useEffect(() => {
        const cachedMessages = localStorage.getItem('messages');
        if (cachedMessages) {
            setMessages(JSON.parse(cachedMessages));
        }
        scrollToBottom();
    }, []);

    useEffect(() => {
        localStorage.setItem('messages', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const handleMessageChange =  (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setMessage(event.target.value);
    };

    const handleSendMessage = async () => {
        if (message.trim() === '') {
            return;
        }

        const newMessage: IMessage = {
            id: messages.length + 1,
            role: 'user',
            content: message,
        };
        setMessages([...messages, newMessage]);
        setMessage('');

        try {
            const response = await axios.post(SERVER_URL + '/generate-text', {messages: messagesRef.current.slice(-4).map((item) => {
                   return {
                       role: item.role,
                       content: item.content
                   }
                })});
            const newMessage: IMessage = {
                id: messages.length + 1,
                role: 'assistant',
                content: response.data.generatedText,
            };
            setMessages([...messagesRef.current, newMessage]);
            scrollToBottom();
        } catch (error) {
            console.error(error);
            // @ts-ignore
            alert(error.response.data.error.message);
        }

    };

    return (
        <div className={classes.root}>
            <Grid container direction="column" spacing={2}>
                {messages.map((message, index) => (
                    <Grid item key={message.id} ref={messages.length === index + 1 ? messagesEndRef : undefined }>
                        <Paper
                            className={
                                message.role === 'user'
                                    ? classes.userMessage
                                    : classes.botMessage
                            }
                        >
                            {message.content}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <Paper className={classes.inputField} ref={inputFieldRef}>
                <TextField
                    className={classes.input}
                    placeholder="Введите сообщение"
                    value={message}
                    spellCheck={ true }
                    maxRows={10}
                    multiline={true}
                    onChange={handleMessageChange}
                    // onKeyUp={(event) => {
                    //     if (event.key === 'Enter') {
                    //         handleSendMessage();
                    //     }
                    // }}
                />
                <IconButton onClick={handleSendMessage}>
                    <SendIcon/>
                </IconButton>
            </Paper>
        </div>
    )
}

export default ChatBot;