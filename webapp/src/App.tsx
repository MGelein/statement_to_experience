import React, { useState } from 'react'
import './App.css'

import { Chart } from './Chart'

import { useInterval } from './utils'

const internalIP = '10.0.1.144'
const host = `http://${internalIP}:3000/`

const randomArray = (total = 10) => {
  let data = []
  for (let element = 0; element < total; element++) {
    const y = Math.floor(Math.random() * 50) + 50
    const obj = {
      x: element,
      y
    }
    data.push(obj)
  }
  return data
}

const App: React.FC = () => {

  const [strength, setStrength] = useState(0.0)
  const [volume, setVolume] = useState(0)

  useInterval(async () => {
    const response = await fetch(host + 'config/strength')
    const newStrength = await response.text()
    setStrength(Number(newStrength))

    const responseVolume = await fetch(host + 'config/volume')
    const newVolume = await responseVolume.text()
    setVolume(Number(newVolume))
  }, 1000)

  // const updateStrength = useCallback(
  //   debounce(() => {
  //     fetch(host + 'config/strength/' + strength)
  //   }, 1000),
  //   []
  // );

  const changeStrength = (event: any) => {
    // updateStrength()
    setStrength(event.target.value / 100)
    fetch(host + 'config/strength/' + strength)
  }

  // const updateVolume = useCallback(
  //   debounce(() => {
  //     fetch(host + 'config/volume/' + volume)
  //   }, 1000),
  //   []
  // );

  const changeVolume = (event: any) => {
    // updateVolume()
    setVolume(event.target.value)
    fetch(host + 'config/volume/' + volume)
  }

  const restart = () => {
    fetch(host + 'board/restart')
  }

  const overwrite = () => {
    fetch(host + 'board-state/overwrite')
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shallow Green</h1>

        <div className="setting">
          <div className="key">Win rate: &nbsp; 81% (+3)</div>
          <div className="value">
            <div className="chart-wrapper">
              <Chart data={randomArray()} color='#3dff3d' svgHeight={100} svgWidth={300} />
            </div>
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
