import React, { useEffect, useRef, useState } from 'react';
import { OpenAIApi, Configuration, CreateChatCompletionResponse } from 'openai';
import { AxiosResponse } from 'axios';
import { rules } from './rules';

import CogIcon from 'mdi-react/CogIcon'
import BroomIcon from 'mdi-react/BroomIcon'
import SendIcon from 'mdi-react/SendIcon'

import Bubble from './components/Bubble';
import Menu from './components/Menu';

export interface Settings {
  apiKey: string
  proxy: string | null
  currentRule: number
}

interface Communication {
  input: string
  output: string
  isLoading: boolean
  bubbleList: JSX.Element[]
}

const history: string[] = []

function App() {

  const params = {
    key: "set your own api key here",
    rule: 0,
    proxy: "proxy address"
  }
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.get('key') != null) {
    params.key = searchParams.get('key') as string
  }
  if (searchParams.get('rule') != null) {
    params.rule = Number.parseInt(searchParams.get('rule') as string)
  }
  if (searchParams.get('proxy') != null) {
    params.proxy = `https://${(searchParams.get('proxy') as string).replaceAll("-", ".")}/v1`
  }


  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [settings, setSettings] = useState<Settings>({
    apiKey: params.key,
    proxy: params.proxy == "proxy address" ? null : params.proxy,
    currentRule: params.rule
  })
  const [api, setApi] = useState<OpenAIApi>(new OpenAIApi(new Configuration({ apiKey: settings.apiKey })))
  const [communication, setCommunication] = useState<Communication>({
    input: "",
    output: "",
    isLoading: false,
    bubbleList: [<Bubble key={0} belongTo="ai" color={rules[settings.currentRule].color} text={rules[settings.currentRule].welcomeMessage} />]
  })

  const [isMenuHidden, setIsMenuHidden] = useState<boolean>(true)

  const changeSettings = (newSettings: Settings) => {
    setSettings({
      ...settings,
      ...newSettings
    })
  }

  useEffect(() => {
    const config = new Configuration({
      apiKey: settings.apiKey,
    })
    if (settings.proxy) {
      config.basePath = settings.proxy
    }
    setApi(new OpenAIApi(config))
  }, [settings.apiKey, settings.proxy])

  useEffect(() => {
    clean()
  }, [settings.currentRule])

  const clean = () => {
    history.length = 0
    setCommunication({
      ...communication,
      bubbleList: [<Bubble key={0} belongTo="ai" color={rules[settings.currentRule].color} text={rules[settings.currentRule].welcomeMessage} />]
    })
  }

  const submit = () => {
    if (inputRef.current) {
      if (inputRef.current.value && inputRef.current.value.length > 0) {
        setCommunication({
          ...communication,
          input: inputRef.current.value,
          isLoading: true,
          bubbleList: communication.bubbleList.concat(<Bubble color={rules[settings.currentRule].color} key={communication.bubbleList.length} belongTo="user" text={inputRef.current.value} />)
        })
        inputRef.current.value = ""
      }
    }
  }

  const submitByShiftEnter = (e: React.KeyboardEvent) => {
    if (e.shiftKey && e.key == 'Enter') {
      submit()
    }
  }

  useEffect(() => {
    if (communication.input != "")
      (async () => {
        try {
          const response = await api.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: 0.1,
            messages: rules[settings.currentRule].prompts(communication.input, history)
          })
          if (response.data.choices[0].message)
            setCommunication({
              input: "",
              isLoading: false,
              output: response.data.choices[0].message.content,
              bubbleList: communication.bubbleList.concat(<Bubble key={communication.bubbleList.length} color={rules[settings.currentRule].color} belongTo="ai" text={response.data.choices[0].message.content} />)
            })     
        } catch {
          setCommunication({
            input: "",
            isLoading: false,
            output: "",
            bubbleList: communication.bubbleList.concat(<Bubble key={communication.bubbleList.length} color={rules[settings.currentRule].color} belongTo="ai" text="**REQUEST FAILED!** have you provide correct `API Key` or `Proxy` in settings menu? " />)
          })
        }
      })()
  }, [communication.input])

  useEffect(() => {
    history.push("Q:" + communication.input)
    history.push("A:" + communication.output)
  }, [communication.output])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [communication.bubbleList]);

  return (
    <div className="lg:max-w-5xl h-screen shadow-md mx-auto flex flex-col">
      <Menu hidden={isMenuHidden} settings={settings} changeSettings={changeSettings} setHidden={() => { setIsMenuHidden(true) }} />
      <div className={`flex-shrink-0 ${rules[settings.currentRule].color} px-4 py-3 shadow-lg`}>
        <CogIcon onClick={() => { setIsMenuHidden(false) }} className='text-white inline-block mx-2 mb-1.5 cursor-pointer' size={36} />
        <BroomIcon onClick={clean} className='text-white inline-block mx-2 mb-1.5 cursor-pointer' size={36} />
        <span className="text-white text-lg font-bold">{rules[settings.currentRule].name}</span>
      </div>
      <div ref={chatRef} className="flex-1 overflow-y-scroll">
        {communication.bubbleList.map(bubble => bubble)}
      </div>
      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex items-center">
          <textarea ref={inputRef} onKeyDown={(e) => submitByShiftEnter(e)} hidden={communication.isLoading} className="flex-1 min-h-16 bg-gray-100 rounded-md px-4 py-2 mr-2 resize-none focus:outline-none" placeholder="Type some text"></textarea>
          <div hidden={!communication.isLoading} className="flex-1 h-16 bg-gray-100 rounded-md px-4 py-2 mr-2 resize-none">
            <div className='h-full grid grid-cols-1 place-items-center'>Loading...</div>
          </div>
          <button onClick={submit} hidden={communication.isLoading} className={`${rules[settings.currentRule].color} h-16 rounded-full text-white px-4 py-2 select-none`}>
            <SendIcon size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
