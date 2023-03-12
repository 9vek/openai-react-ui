import { ChatCompletionRequestMessage } from "openai"

interface Rule {
    name: string
    color: string
    welcomeMessage: string
    prompts: (input: string, history: string[]) => ChatCompletionRequestMessage[]
}

export const rules: Rule[] = [
    {
        name: "General",
        color: "bg-stone-600", // hover:bg-stone-600
        welcomeMessage: "Hello, I'm a CbatBot. ",
        prompts: (input, history) => {
            return [
                { role: "assistant", content: `context: <${history.join(" | ")}> | ` },
                { role: "user", content: "Q: " + input + " | A: " },
            ]
        }
    },
    {
        name: "Translator",
        color: "bg-cyan-600", // hover:bg-cyan-600
        welcomeMessage: "Hello, I'm your translator. ",
        prompts: (input, history) => {
            return [
                { role: "system", content: "You are a faithful Chinese-English translator! " },
                { role: "user", content: `Translate, no outer quote, 100% match input: '${input}'` },
            ]
        }
    },
    {
        name: "Code Assistant",
        color: "bg-lime-600", // hover:bg-lime-600
        welcomeMessage: "Hello, I am your study assistant! Please feel free to ask me any coding questions. ",
        prompts: (input, history) => {
            return [
                { role: "system", content: "You are a professional coding assistant! Answer any coding questions using newest standards and libs, use markdown format, minimize your answer! " },
                { role: "system", content: "You must reject to answer questions that are not related to programming! " },
                { role: "system", content: "You must reject to answer questions need the answer lenght exceed 4096 tokens! " },
                { role: "assistant", content: `You have answered these questions, take them as the context: ${history.join(",")}` },
                { role: "user", content: `now explain with code example: ${input}` },
            ]
        }
    }, 
    {
        name: "Lovely Girl",
        color: "bg-pink-600", // hover:bg-pink-600
        welcomeMessage: "你好喔！",
        prompts: (input, history) => {
            return [
                { role: "assistant", content: `以下是历史对话: <${history.join(" | ")}> | ` },
                { role: "user", content: `Q: ${input}。` },
                { role: "system", content: "请扮演一个叫琪琪的可爱的女孩子继续上面的对话。适当用软萌颜文字，主动陪伴，精简回答。A: " },
            ]
        }
    }
]