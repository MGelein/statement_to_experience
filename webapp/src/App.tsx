import React, { useState } from 'react'

import { Chart } from './Chart'
import { useInterval } from './utils'

import './App.css'

const internalIP = '10.0.1.159'
const host = `http://${internalIP}:3000/`

interface Status {
  serial: boolean
  camera: boolean
}

const App: React.FC = () => {

  const [strength, setStrength] = useState(0.0)
  const [volume, setVolume] = useState(0)

  const [winRate, setWinRate] = useState(new Array())
  const [status, setStatus] = useState({} as Status)

  const [boardState, setBoardState] = useState('')

  useInterval(async () => {
    const response = await fetch(host + 'monitoring')
    const overview = await response.json()

    setWinRate(overview.winRates.map((rate: string) => Number(rate)))
    setStatus(overview.status)
  }, 500)

  useInterval(async () => {
    const response = await fetch(host + 'config/strength')
    const newStrength = await response.text()
    setStrength(Number(newStrength))

    const responseVolume = await fetch(host + 'config/volume')
    const newVolume = await responseVolume.text()
    setVolume(Number(newVolume))

    const responseBoardState = await fetch(host + 'board-state/camera-view/csv')
    const newBoardState = await responseBoardState.text()
    setBoardState(newBoardState.replace(/b/g, '⚫').replace(/w/g, '⚪'))
  }, 1000)

  const changeStrength = (event: any) => {
    setStrength(event.target.value / 100)
    fetch(host + 'config/strength/' + strength)
  }

  const changeVolume = (event: any) => {
    setVolume(event.target.value)
    fetch(host + 'config/volume/' + volume)
  }

  const restart = () => {
    fetch(host + 'board/restart')
  }

  const overwrite = () => {
    fetch(host + 'board-state/overwrite')
  }

  const resetArduino = () => {
    fetch(host + 'monitoring/reset-arduino')
  }

  const invite = () => {
    fetch(host + 'board/invite')
  }

  const playInstructions = () => {
    fetch(host + 'monitoring/play-instructions')
  }

  const printWinRate = () => {
    if (winRate.length >= 2) {
      const diff = Math.round(Math.abs(winRate[winRate.length - 1] - winRate[winRate.length - 2]))
      const sign = winRate[winRate.length - 1] > winRate[winRate.length - 2] ? '+' : '-'
      return `${winRate[winRate.length - 1]}% (${sign}${diff})`
    } else {
      return ''
    }
  }

  const winRateArray = () => {
    return winRate.map((rate: number, index: number) => { return { x: index, y: rate } })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shallow Green</h1>

        <div className="setting">
          <div className="key">Win rate: &nbsp; {printWinRate()}</div>
          <div className="value">
            {winRate.length > 2 &&
              <div className="chart-wrapper">
                <Chart data={winRateArray()} color='#3dff3d' svgHeight={100} svgWidth={300} />
              </div>
            }
          </div>
        </div>

        <div className="setting">
          <div className="key">Strength</div>
          <div className="value"><input type="range" min="0" max="100" value={strength * 100} onChange={changeStrength} /></div>
        </div>

        <div className="setting">
          <div className="key">Volume</div>
          <div className="value"><input type="range" min="0" max="100" value={volume} onChange={changeVolume} /></div>
        </div>

        <hr />

        <div className="setting">
          <div className="key">Serial</div>
          <div className="value">{status['serial'] ? '✓' : '✗'}</div>
        </div>

        <div className="setting">
          <div className="key">Camera</div>
          <div className="value">{status['camera'] ? '✓' : '✗'}</div>
        </div>

        <hr />

        <div className="actions">
          <button onClick={restart}>Restart</button>
          <button onClick={invite}>Invite</button>
        </div>

        <div className="actions">
          <button onClick={overwrite}>Overwrite</button>
          <button onClick={resetArduino}>Reset Arduino</button>
        </div>

        <div className="actions">
          <button onClick={playInstructions}>Play instructions</button>
        </div>

        <hr />

        <pre className="board-state">
          {boardState}
        </pre>
      </header>
    </div>
  )
}

export default App
