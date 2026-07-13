import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import {
    RiSettings3Line, RiSunLine, RiMoonFill, RiSendPlane2Fill,
    RiAttachment2
} from 'react-icons/ri';
import { CodeBlock, FileResponse, FormResponse, ImageResponse, JsonResponse, PollResponse } from './ChatParser';
import HistorySidebar from './History';
import SettingsPanel from './ChatSetting';
import { HubConnectionBuilder, JsonHubProtocol, HubConnection, HttpTransportType, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { BaseEndpoints } from '../../config/BaseEndpoints';
import axios from 'axios';
import { MdDelete } from 'react-icons/md';
import { v4 as uuidv4 } from "uuid";
import { useTheme } from '../../context/ThemeContext';
const ThemeToggleButton = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-zinc-800 text-zinc-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-500 transition-colors" aria-label={t('ThemeSwitcher.Light')}>
            {theme === 'dark' ? <RiSunLine size={20} /> : <RiMoonFill size={20} />}
        </button>
    );
};

const BotTypingIndicator = () => (
    <div className="flex items-center gap-2 self-start">
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-slate-200 dark:bg-zinc-800">
            <span className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce delay-0"></span><span className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce delay-150"></span><span className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce delay-300"></span>
        </div>
    </div>
);


const ChatMessage = ({ message, onInteraction }:
    {
        message: any,
        onInteraction: (userResponse: any, botResponse?: string) => void
    }) => {
    const { t } = useTranslation();
    // console.log(message,onInteraction);
    //  RoomName: roomName,
    // ChatContentCode: "MSG",
    // Message: newMessage.trim(),
    // ContentPath: "",
    // SenderConnectionId: "",
    // SenderId: "user",
    // RecieverId: 'aiassistant',
    // RecieverConnectionId: "",
    // RoomId: 0,
    // SenderName: senderName,
    // IsSendToRoom: true,
    // SenderAvatar: senderPic,
    // IsGroup: false
    console.log("ChatMessage", message)
    const isUser = message.SenderId === 'user';
    const wrapperClass = isUser ? 'self-end items-end' : 'self-start items-start';
    const bubbleClass = isUser ? 'bg-red-600 text-white rounded-xl rounded-br-none' : 'bg-slate-200 dark:bg-zinc-800 text-zinc-800 dark:text-slate-200 rounded-xl rounded-bl-none';
    const content = message.ChatContentCode === 'text' ? <p>{message.Message}</p> : null;
    return (
        <div className={`max-w-xl w-fit flex flex-col ${wrapperClass}`}>
            {message.ChatContentCode === 'text' ? <div className={`px-4 py-3 ${bubbleClass}`}>{message.Message}</div> :
                message.ChatContentCode === 'code' ? <CodeBlock language={message.CodeLanguage} code={message.Code} /> :
                    message.ChatContentCode === 'json' ? <JsonResponse data={message.JsonResponse} /> :
                        message.ChatContentCode === 'image' ? <ImageResponse src={message.ImageUrl} alt={''} filename={message.ImageName} /> :
                            message.ChatContentCode === 'file' ? <FileResponse filename={message.FileName} filetype={message.FileType} url={message.FileUrl} /> :
                                message.ChatContentCode === 'poll' ? <PollResponse question={message.PollQuestion} options={message.PollOptions} onSelect={(option) => onInteraction(`Selected: ${option}`, `You chose "${option}". Great!`)} /> :
                                    message.ChatContentCode === 'form' ? <FormResponse title={message.FormTitle} fields={message.FormFields} onSubmit={(data) => onInteraction(data, t("Chat.ThankYou"))} /> : null
            }
        </div>
    );
};



const Chat = ({ assistant }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<any>([
        { ChatContentId: 0, SenderId: 'bot', ChatContentCode: 'text', Message:assistant?.GreetingText|| t('Chat.TypeMessage') }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isBotTyping, setBotTyping] = useState(false);
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const [roomName, setRoomName] = useState('testroom');
    const [sgnlrConnection, setSgnlrConnection] = useState<any>(undefined);
    const [sessionId, setSessionId] = useState<any>(localStorage.getItem('session') || "");
    const [uploadedFiles, setUploadedFiles] = useState<any>([]);
    const [currentChatId, setCurrentChatId] = useState<any>(localStorage.getItem("ccid") || 0);


    const chatEndRef = useRef<HTMLDivElement>(null);

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping]);

    const handleInteraction = (userResponse: any, botResponseText?: string) => {
        const content = typeof userResponse === 'string' ? userResponse : `Form Submitted: ${JSON.stringify(userResponse, null, 2)}`;
        const userMessage = { id: Date.now(), sender: 'user', type: 'text', content: content };
        setMessages(prev => [...prev, userMessage]);
        if (botResponseText) {
            setBotTyping(true);
            setTimeout(() => {
                const botResponse = { id: Date.now() + 1, sender: 'bot', type: 'text', content: botResponseText };
                setBotTyping(false);
                setMessages(prev => [...prev, botResponse]);
            }, 1200);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const userQuery = newMessage;

        SendMessage();
    };

    const getFileExtension = (file: any) => {
        var regexp = /\.([0-9a-z]+)(?:[\?#]|$)/i;
        var extension = file.match(regexp);
        return extension && extension[1];
    };


    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {

        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            setSelectedFiles(prevFiles => {
                const newFiles = filesArray.filter(file => !prevFiles.some(prevFile => prevFile.name === file.name && prevFile.size === file.size && prevFile.type === file.type));
                return [...prevFiles, ...newFiles];
            });
        }
    };

    const handleRemoveSelectedFile = (indexToRemove: number) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };
    useEffect(() => {
        if (selectedFiles.length > 0)
            handleFileUpload();
    }, [selectedFiles])
    const handleFileUpload = async () => {
        if (selectedFiles.length === 0) {
            return;
        }

        // Upload each selected file
        for (const selectedFile of selectedFiles) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("fdr", "chat-uploads");
            try {
                const response = await axios.post(`${BaseEndpoints.base}/api/chat/ajaxfileupload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.status === 200 && response.data.isUploaded) {
                    // const fileData = {
                    //     filename: selectedFile.name,
                    //     filetype: selectedFile.type,
                    //     url: response.data.savedFilePath,
                    // };
                    // const botResponse = {
                    //     id: Date.now() + 1,
                    //     sender: "bot",
                    //     type: "file",
                    //     content: fileData,
                    // };
                    // setMessages((prev) => [...prev, botResponse]);

                } else {
                    //alert(`File upload failed for ${selectedFile.name}!`);
                }
            } catch (error) {
                console.error("File upload error:", error);
                //alert(`File upload failed for ${selectedFile.name}!`);
            }
        }


    };

    useEffect(() => {
        let existingSession = localStorage.getItem("session");

        if (!existingSession || existingSession.trim() === "") {
            const newSession = uuidv4(); // generate new unique ID
            localStorage.setItem("session", newSession);
            setSessionId(newSession);
        } else {
            setSessionId(existingSession);
        }
    }, []);
    const connectionRef = useRef<HubConnection | null>(null);
    const createdRef = useRef(false);
    const startedRef = useRef(false);

    useEffect(() => {
        if (createdRef.current)
            return;
        createdRef.current = true;

        const hubRoute = `${BaseEndpoints.base}/hubs/aichat`;

        const conn = new HubConnectionBuilder()
            .withUrl(hubRoute, {
                accessTokenFactory: () => localStorage.getItem("token") || "",
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets,
            })
            .withHubProtocol(new JsonHubProtocol())
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: ctx => {
                    if (ctx.elapsedMilliseconds < 60000) return Math.random() * 10000;
                    return null;
                }
            })
            .build();

        conn.on("onUserChange", (userChanged: any) => { /* ... */ });
        conn.on("onError", onError);
        conn.on("onChatRoomAdded", onChatRoomAdded);
        conn.on("onChatRoomUpdate", onChatRoomUpdate);
        conn.on("onRoomDeleted", onRoomDeleted);
        conn.on("onRoomUserUpdate", onRoomUserUpdate);
        conn.on("onChatRoomRemoveUser", onChatRoomRemoveUser);
        conn.on("onNewContentRecieved", onNewContentRecieved);
        conn.on("onOlderContentRecieved", onOlderContentRecieved);
        conn.on("onUserTyping", onUserTyping);
        conn.on("onUserTypingStop", onUserTypingStop);
        conn.on("onSeen", onSeen);
        conn.on("onDelivered", onDelivered);
        conn.on("onBroadcastMessage", (content: any) => {
        });

        connectionRef.current = conn;
        setSgnlrConnection(conn);

        (async () => {
            if (startedRef.current) return;
            startedRef.current = true;
            try {
                await conn.start();
                setTimeout(() => {
                    conn.invoke("Join", { RoomName: roomName, RoomId: 0 });
                }, 3000);

            } catch (e: any) {
                console.error("SignalR start failed:", e?.message ?? e);
                startedRef.current = false;
            }
        })();

        return () => {
        };
    }, []);



    const SendMessage = async () => {
        let senderName = "Guest";
        let senderId = "";
        let senderPic = ''

        const data = {
            AIAssistantId: assistant?.AIAssistantId,
            AIAssistantChatId:parseInt(currentChatId),
            UserId: 0,
            SessionId: sessionId,
            RoomName: roomName,
            IpAddress: '',
            Browser: '',
            ChatContentCode: "text",
            Message: newMessage.trim(),
            Files: uploadedFiles,
            ContentPath: "",
            SenderId: "user",
            RecieverId: 'aiassistant',
            IsAssistantResponded:false
        }

        sgnlrConnection.invoke("SendToRoom", data);
        setNewMessage('');
        setBotTyping(true);
        // Clear selected files and reset the file input after all uploads
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setUploadedFiles([]);

    }
    const onError = (error: string) => {
        console.log("err", error)
    }
    const onChatRoomAdded = (room: any) => {
    }
    const onChatRoomUpdate = (rooms: any) => {
    }
    const onChatRoomRemoveUser = (user: any) => {

    }
    const onRoomDeleted = (room: any) => {

    }
    const onRoomUserUpdate = (users: any) => {

    }
    const onNewContentRecieved = (content: any) => {
        if (content?.IsAssistantResponded == true) {
            setBotTyping(false);
        }
        setCurrentChatId(content?.AIAssistantChatId);
        localStorage.setItem("ccid", content?.AIAssistantChatId);
        // console.log("new", content);
        setMessages(prev => [...prev, content]);

    }
    const onOlderContentRecieved = (contents: any) => {
        if (contents.length > 0) {
            setMessages(contents);
        }
    }
    const onUserChange = (status: any) => {

    }
    const onUserTypingStop = (content: any) => {
        if (content.RoomName == roomName) {
        }
    }
    const onDelivered = (content: any) => {
    }
    const onSeen = (userid: any, room: any, id: any) => {
    }
    const onUserTyping = (content: any) => {
        if (content.RoomName == roomName) {
        }
    }
    return (
        <div className="h-screen w-screen bg-slate-50 dark:bg-zinc-950 font-sans antialiased flex flex-col overflow-hidden">
            <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-sm z-20">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-semibold text-zinc-900 dark:text-slate-100">{t('Chat.Send')}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setSettingsVisible(true)}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800">
                        <RiSettings3Line size={24} className="text-zinc-600 dark:text-slate-300" />
                    </button>
                    <ThemeToggleButton />
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden relative">
                <main className="flex-1 flex flex-col">
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <div className="flex flex-col gap-4">
                            {messages.map((msg) => (<ChatMessage key={msg.ChatContentId} message={msg} onInteraction={handleInteraction} />))}
                            {isBotTyping && <BotTypingIndicator />}<div ref={chatEndRef} />
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
                        {selectedFiles.length > 0 && (<div className="flex flex-row gap-2 p-3">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="relative mr-2">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-20 h-20 rounded-md object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-0 right-0 p-1 rounded-full text-white bg-red-500 hover:bg-red-700"
                                        onClick={() => handleRemoveSelectedFile(index)}
                                        aria-label={t('TagsInput.Add')}
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </div>
                            ))}

                        </div>)}
                        <form onSubmit={handleSendMessage} className="relative">


                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder={t('Chat.TypeMessage')}
                                rows={1}
                                className="w-full resize-none p-3 pr-28 rounded-lg bg-slate-100 dark:bg-zinc-800 border-transparent focus:ring-2 focus:ring-red-500 outline-none" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    multiple
                                />
                                <button
                                    type="button"
                                    className="p-2 text-zinc-500 dark:text-slate-400 hover:text-red-500"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <RiAttachment2 size={22} />
                                </button>



                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2 rounded-md bg-red-600 text-white disabled:bg-red-400/50 hover:bg-red-700"
                                >
                                    <RiSendPlane2Fill size={22} />
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
                <SettingsPanel isVisible={isSettingsVisible} onClose={() => setSettingsVisible(false)}
                    assistant={assistant}
                />
            </div>
        </div>
    );
};

export default Chat;