import React from "react";
import { marked } from "marked";

interface BubbleType {
    belongTo: "user" | "ai"
    color: string
    text: string
}

function Bubble(props: BubbleType) {
    let bgColor = props.color
    let layout = "items-end mr-2 ml-6"
    let content = props.text
    if (props.belongTo === "ai") {
        bgColor = "bg-gray-100"
        layout = "items-start mr-6 ml-2"
        content = marked.parse(props.text)
    }

    const BubbleCore = () => {
        if (props.belongTo === "ai") {
            return <div className={`markdown-body`} dangerouslySetInnerHTML={{ __html: content }}></div>
        } else {
            return <div className="text-gray-100">{content}</div>
        }
    }

    return (
        <div className="w-full">
            <div className={`flex flex-col ${layout} justify-start py-2`}>
                <div className={`${bgColor} w-fit max-w-full rounded-lg px-4 py-2 lg:max-w-4xl`}>
                    {BubbleCore()}
                </div>
            </div>
        </div>
    )
}

export default Bubble