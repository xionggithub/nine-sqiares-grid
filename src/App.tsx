import { useState } from 'react'
import './App.css'
import { NineSquaresGrid } from "./components/nineSquaresGrid";
import { ConfigPanel } from "./components/configPanel";
import { DashboardState, dashboard } from "@lark-base-open/js-sdk";

function App() {
  return (
    <div className="grid-app">
        <NineSquaresGrid/>

        {dashboard.state === DashboardState.Create || dashboard.state === DashboardState.Config ? (
            <ConfigPanel/>
        ) : null}
    </div>
  )
}

export default App
