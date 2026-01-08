import React from 'react';
import './App.css';
import Flowsheet from './flowsheet/Flowsheet';

// PUBLIC_INTERFACE
function App() {
  /** Root application component showing the Flowsheet screen. */
  return (
    <div className="App">
      <Flowsheet />
    </div>
  );
}

export default App;
