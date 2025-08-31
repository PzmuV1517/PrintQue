import { Link, Routes, Route } from 'react-router-dom'
import './App.css'
import QueuePage from './pages/QueuePage'
// Make sure the file exists at the specified path, or update the path if necessary
import RequestPage from './pages/RequestPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <div className="app-container">
      <nav className="nav">
  <h1>PrintQue</h1>
        <div className="links">
          <Link to="/">Queue</Link>
          <Link to="/request">New Request</Link>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
