import { useEffect, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../api'

interface PrintJob {
  id: string
  team: string
  contact: string
  comments?: string
  specs?: string
  filename: string
  created_at: string
}

export default function AdminPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([])
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  const storageKey = 'adminAuth'
  const authHeader = () => ({ Authorization: 'Basic ' + (loggedIn ? localStorage.getItem(storageKey) : btoa(user + ':' + pass)) })

  const load = async () => {
    try {
  await axios.get(apiUrl('/admin/auth'), { headers: authHeader() })
      // on first successful auth, persist credentials
      if(!loggedIn) {
        const cred = btoa(user + ':' + pass)
        localStorage.setItem(storageKey, cred)
        setLoggedIn(true)
      }
  const res = await axios.get<PrintJob[]>(apiUrl('/queue'))
      setJobs(res.data)
      setError(null)
    } catch (e: any) {
      setLoggedIn(false)
      setError(e.response?.status === 401 ? 'Unauthorized: check credentials' : e.message)
      setJobs([])
    }
  }

  // On mount, try existing stored credentials (if any)
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if(stored) {
  axios.get(apiUrl('/admin/auth'), { headers: { Authorization: 'Basic ' + stored } })
        .then(async () => {
          setLoggedIn(true)
          setError(null)
          const res = await axios.get<PrintJob[]>(apiUrl('/queue'))
          setJobs(res.data)
        })
        .catch(() => {
          localStorage.removeItem(storageKey)
          setLoggedIn(false)
        })
    }
  }, [])

  // Refresh queue every 5s while logged in
  useEffect(() => {
    if(!loggedIn) return
    const t = setInterval(() => {
  axios.get<PrintJob[]>((apiUrl('/queue'))).then(r=>setJobs(r.data)).catch(()=>{})
    }, 5000)
    return () => clearInterval(t)
  }, [loggedIn])

  const logout = () => {
    localStorage.removeItem(storageKey)
    setLoggedIn(false)
    setJobs([])
    setUser('')
    setPass('')
  }

  const download = async (id: string, filename: string) => {
    try {
  const res = await axios.get(apiUrl(`/queue/${id}/download`), { headers: authHeader(), responseType: 'blob' })
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e: any) { alert('Download failed: ' + e.message) }
  }

  const remove = async (id: string) => {
    if(!confirm('Delete this job?')) return
    try {
  await axios.delete(apiUrl(`/queue/${id}`), { headers: authHeader() })
      setJobs(jobs.filter(j=>j.id!==id))
    } catch (e: any) { alert('Delete failed: ' + e.message) }
  }

  return (
    <div>
      <h2>Admin</h2>
      <div className="login-box">
        {!loggedIn && (
          <>
            <input placeholder="User" value={user} onChange={e=>setUser(e.target.value)} />
            <input placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
            <button onClick={load}>Login</button>
          </>
        )}
        {loggedIn && (
          <>
            <button onClick={load}>Refresh Now</button>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
  {error && <p style={{color:'red'}}>{error}</p>}
  {loggedIn && !error && <p style={{fontSize:'.75rem', opacity:.7}}>Logged in (auto-refreshing every 5s).</p>}
      <ul className="admin-list">
        {jobs.map(j => (
          <li key={j.id}>
            <div className="row">
              <strong>{j.team}</strong> ({j.filename})
              <div className="actions">
                <button onClick={() => download(j.id, j.filename)}>Download</button>
                <button onClick={() => remove(j.id)}>Delete</button>
              </div>
            </div>
            <div className="details">
              <div><b>Contact:</b> {j.contact}</div>
              {j.comments && <div><b>Comments:</b> {j.comments}</div>}
              {j.specs && <div><b>Specs:</b> {j.specs}</div>}
              <div className="meta">Submitted {new Date(j.created_at).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
