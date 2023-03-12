import React, { useEffect, useRef, useState } from 'react';
import { OpenAIApi, Configuration, CreateChatCompletionResponse } from 'openai';
import { AxiosResponse } from 'axios';
import { rules } from './rules';

import CogIcon from 'mdi-react/CogIcon'
import BroomIcon from 'mdi-react/BroomIcon'

import Bubble from './components/Bubble';
import Menu from './components/Menu';

export interface Settings {
  apiKey: string
  proxy: string | null
  currentRule: number
}

let bubbleKey = 0
const history: string[] = []

function App() {

  const params = {
    key: "set your own api key here",
    rule: 0
  }
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.get('key') != null) {
    params.key = searchParams.get('key') as string
  }
  if (searchParams.get('rule') != null) {
    params.rule = Number.parseInt(searchParams.get('rule') as string)
  }
  

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [settings, setSettings] = useState<Settings>({
    apiKey: params.key,
    proxy: null,
    currentRule: params.rule
  })
  const [api, setApi] = useState<OpenAIApi>(new OpenAIApi(new Configuration({ apiKey: settings.apiKey })))
  const [input, setInput] = useState<string>("")
  const [resp, setResp] = useState<AxiosResponse<CreateChatCompletionResponse, any> | null>();
  const [bubbleList, setBubbleList] = useState<JSX.Element[]>([<Bubble key={bubbleKey} belongTo="ai" color={rules[settings.currentRule].color} text={rules[settings.currentRule].welcomeMessage} />])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isMenuHidden, setIsMenuHidden] = useState<boolean>(true)

  const changeSettings = (newSettings: Settings) => {
    setSettings({
      ...settings,
      ...newSettings
    })
  }

  const clean = () => {
    history.length = 0
    setBubbleList([<Bubble key={bubbleKey} belongTo="ai" color={rules[settings.currentRule].color} text={rules[settings.currentRule].welcomeMessage} />])
  }

  const submit = () => {
    if (inputRef.current) {
      if (inputRef.current.value && inputRef.current.value.length > 0) {
        setIsLoading(true)
        setInput(inputRef.current.value);
        inputRef.current.value = ""
      }
    }
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

  useEffect(() => {    
    if (input.length > 0) {
      bubbleKey++
      setBubbleList(bubbleList.concat(<Bubble color={rules[settings.currentRule].color} key={bubbleKey} belongTo="user" text={input} />));
      (async () => {
        try {
          const response = await api.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: 0.1,
            messages: rules[settings.currentRule].prompts(input, history)
          })
          setResp(response)
        } catch {
          setResp(null)
        }
      })()
    }
  }, [input])

  useEffect(() => {
    bubbleKey++
    if (resp) {
      if (resp.data.choices[0].message) {
        if (resp.data.choices[0].message.content.length > 0) {

          setBubbleList(bubbleList.concat(<Bubble key={bubbleKey} color={rules[settings.currentRule].color} belongTo="ai" text={resp?.data.choices[0].message.content} />))
          history.push("Q:" + input)
          history.push("A:" + resp.data.choices[0].message.content)
        }
      }
    } else if (bubbleList.length > 1) {
      setBubbleList(bubbleList.concat(<Bubble key={bubbleKey} color={rules[settings.currentRule].color} belongTo="ai" text="**REQUEST FAILED!** have you provide correct `API Key` or `Proxy` in settings menu? " />))
    }
    setIsLoading(false)
    setInput("")
  }, [resp])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [bubbleList]);

  return (
    <div className="lg:max-w-5xl h-screen shadow-md mx-auto flex flex-col">
      <Menu hidden={isMenuHidden} settings={settings} changeSettings={changeSettings} setHidden={() => { setIsMenuHidden(true) }} />
      <div className={`flex-shrink-0 ${rules[settings.currentRule].color} px-4 py-3`}>
        <CogIcon onClick={() => { setIsMenuHidden(false) }} className='text-white inline-block mx-2 mb-1.5 cursor-pointer' size={36} />
        <BroomIcon onClick={clean} className='text-white inline-block mx-2 mb-1.5 cursor-pointer' size={36} />
        <span className="text-white text-lg font-bold">{rules[settings.currentRule].name}</span>
      </div>
      <div ref={chatRef} className="flex-1 overflow-y-scroll">
        {bubbleList.map(bubble => bubble)}
      </div>
      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex items-center">
          <textarea ref={inputRef} hidden={isLoading} className="flex-1 min-h-16 bg-gray-100 rounded-md px-4 py-2 mr-2 resize-none focus:outline-none" placeholder="Type some text"></textarea>
          <div hidden={!isLoading} className="flex-1 h-16 bg-gray-100 rounded-md px-4 py-2 mr-2 resize-none">
            <div className='h-full grid grid-cols-1 place-items-center'>Loading...</div>
          </div>
          <button onClick={submit} hidden={isLoading} className={`${rules[settings.currentRule].color} h-16 rounded-full text-white px-4 py-2 select-none`}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
