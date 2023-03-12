import { Settings } from "../App"
import React, { useState } from "react"
import { rules } from "../rules"

interface MenuType {
  hidden: boolean
  setHidden: () => void
  settings: Settings
  changeSettings: (newSettings: Settings) => void
}

const Menu = (props: MenuType) => {

  const [settings, setSettings] = useState(props.settings)

  const renderAllRules = () => {
    return (
      rules.map((rule, index) => (
        <div
          key={index}
          onClick={() => setSettings({...settings, currentRule: index})}
          className={`inline-block py-2 px-3 m-2 rounded-lg text-lg select-none transition-colors font-bold cursor-pointer text-stone-50 ${ index === settings.currentRule ? rule.color : "bg-stone-400" } hover:${rule.color}`}>
          <span>{rule.name}</span>
        </div>
      ))
    )
  }

  const save = () => {
    props.changeSettings(settings)
    props.setHidden()
  }

  const cancel = () => {
    setSettings(props.settings)
    props.setHidden()
  }

  return (
    <div
      className={`w-full h-full py-16 px-4 fixed top-0 left-0 z-50 bg-opacity-30 bg-stone-900 ${props.hidden ? "hidden" : ""}`}
    >
      <div className="w-full mx-auto max-w-4xl h-full bg-white rounded-lg flex flex-col justify-between">
        <div className="p-4">
          <div className="text-4xl font-bold my-2">Settings</div>
          <div className="text-2xl font-bold mb-2 mt-4">API Key</div>
          <div>
            <input placeholder={settings.apiKey} onChange={(e) => settings.apiKey = e.target.value} type="text" className="appearance-none border rounded w-full py-2 px-3 text-stone-900 bg-transparent leading-tight focus:outline-none focus:border-stone-400" />
          </div>
          <div className="text-2xl font-bold mb-2 mt-4">Proxy Server</div>
          <div>
            <input placeholder={settings.proxy ? settings.proxy : "proxy address"} onChange={(e) => settings.proxy = e.target.value} type="text" className="appearance-none border rounded w-full py-2 px-3 text-stone-900 bg-transparent leading-tight focus:outline-none focus:border-stone-400" />
          </div>
          <div className="text-2xl font-bold mb-2 mt-4">Current Rule</div>
          <div>
            { renderAllRules() }
          </div>
        </div>
        <div className="mt-auto p-4 grid grid-cols-2">
          <div className="p-4">
            <button
              className="bg-stone-900 w-full text-white text-xl py-4 rounded-lg hover:bg-stone-800"
              onClick={save}
            >
              Save
            </button>
          </div>
          <div className="p-4">
            <button
              className="bg-red-900 w-full text-white text-xl py-4 rounded-lg hover:bg-red-800"
              onClick={cancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Menu