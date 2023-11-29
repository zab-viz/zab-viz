import './App.css';
import Cluster from './components/Cluster';

function App() {
  return (
    <div className="App">
      <header className="App-title">
        <h1>ZAB Viz</h1>
        <p>A Visualization tool for Zookeeper Atomic Broadcast Protocol</p>
      </header>
      <Cluster />
    </div>
  );
}

export default App;
