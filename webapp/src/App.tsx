import React, { useState } from 'react'

import { Chart } from './Chart'
import { useInterval } from './utils'

import './App.css'

const internalIP = '10.0.1.144'
const host = `http://${internalIP}:3000/`

const App: React.FC = () => {

  const [strength, setStrength] = useState(0.0)
  const [volume, setVolume] = useState(0)

  const [winRate, setWinRate] = useState(new Array())

  useInterval(async () => {
    const response = await fetch(host + 'config/strength')
    const newStrength = await response.text()
    setStrength(Number(newStrength))

    const responseVolume = await fetch(host + 'config/volume')
    const newVolume = await responseVolume.text()
    setVolume(Number(newVolume))

    const responseWinRate = await fetch(host + 'board/win-rate')
    const newWinRate = await responseWinRate.text()
    setWinRate(newWinRate.split(',').map((rate: string) => Number(rate) * 100))
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

        <div className="actions">
          <button onClick={restart}>Restart</button>
          <button onClick={overwrite}>Overwrite</button>
        </div>
      </header>
    </div>
  )
}

export default App
