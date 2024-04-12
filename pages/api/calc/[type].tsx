import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai';

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { type } = req.query
    const { prompt, apiKey }: {
        prompt: string,
        apiKey: string
    } = req.body
    const openai = new OpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });
    if (type == '0') {
        openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
        }).then((response) => {
            res.status(200).json(response)
        }).catch((error) => {
            res.status(500).json({ error: error })
        });
    } else if (type == '1') {
        openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1792x1024',
        }).then((response) => {
            console.log(response)
            res.status(200).json(response)
        }).catch((error) => {
            res.status(500).json({ error: error.error })
        });
    } else {
        res.status(404).json({ error: 'Invalid type' })
    }
}