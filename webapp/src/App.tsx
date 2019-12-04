import React, { useState } from 'react'
import './App.css'

import { useInterval } from './utils'

const internalIP = '132.229.130.80'
const host = `http://${internalIP}:3000/`

const App: React.FC = () => {

  const [strength, setStrength] = useState(0.0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  useInterval(async () => {
    const response = await fetch(host + 'config/strength')
    const newStrength = await response.text()
    setStrength(Number(newStrength))

    const responseVoice = await fetch(host + 'config/voice')
    const newVoiceEnabled = await responseVoice.text()
    setVoiceEnabled(newVoiceEnabled === '1')
  }, 1000)

  const changeStrength = (event: any) => {
    fetch(host + 'config/strength/' + event.target.value / 100)
    setStrength(event.target.value / 100)
  }
  
  const changeVoiceEnabled = (event: any) => {
    fetch(host + 'config/voice/' + (event.target.checked ? '1' : '0'))
    setVoiceEnabled(event.target.checked)
  }

  const restart = () => {
    fetch(host + 'board/restart')
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shallow Green</h1>

        <div className="setting">
          <div className="key">Strength</div>
          <div className="value"><input type="range" min="0" max="100" value={strength * 100} onChange={changeStrength} /></div>
        </div>

        <div className="setting">
          <div className="key">Voice enabled</div>
          <div className="value"><input type="checkbox" name="voice" checked={voiceEnabled} onChange={changeVoiceEnabled} /></div>
        </div>

        <button onClick={restart}>Restart</button>
      </header>
    </div>
  )
}

export default App
