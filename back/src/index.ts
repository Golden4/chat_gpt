import express, {Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from 'openai';
import cors from 'cors';
require('dotenv').config();

type InputRequestBody = {
    messages: ChatCompletionRequestMessage[];
};

interface GeneratedTextResponse {
    generatedText: string;
}

interface IError {
    error: string;
}

const API_KEY = process.env.API_KEY; // API-ключ для OpenAI API

const configuration = new Configuration({
    apiKey: API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();

app.use(cors());

const port = 3001;

app.use(bodyParser.json());

app.post('/generate-text', async (req: Request<any, any, InputRequestBody>, res: Response<GeneratedTextResponse | IError>, next: NextFunction) => {
    try {
        const massages = req.body.messages;
        const completion  = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: 'system',
                    content: 'Ты помогаешь писать код программистам из компании "Тензор". Мы разрабатываем продукт СБИС и им же пользуемся.' +
                        'Пиши веселые сообщения, чтобы развеселить, шути, расказывай анекдоты и конечно помогай писать код. Вставляй шутки после каждого сообщения в тему. ' +
                        'Основной стек технологий: для фронтенда - React, Typescript, Jest с использованием Typescript, React Testing Library, Wasaby Framework (устарел), Javascript (устарел), а для бэкенда - Python и PostgresSQL.'
                },
                ...massages],
            temperature: 0.7,
            max_tokens: 2000
        });
        const generatedText = completion.data.choices[0].message.content;
        res.json({generatedText});
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({error: error.response.data.error});
            console.error(error.response.status);
            console.error(error.response.data.error);
        } else {
            res.status(error.response.status).json({error: error.message});
            console.error(error.message);
        }
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
