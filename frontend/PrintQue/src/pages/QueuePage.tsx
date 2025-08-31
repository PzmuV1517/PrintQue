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

export default function QueuePage() {
  const [jobs, setJobs] = useState<PrintJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // Initial load with loading, then poll in background without flicker
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get<PrintJob[]>(apiUrl('/queue'))
      .then(res => { if(mounted) setJobs(res.data) })
      .catch(e => { if(mounted) setError(e.message) })
      .finally(() => { if(mounted) setLoading(false) });

    const poll = setInterval(() => {
      axios.get<PrintJob[]>(apiUrl('/queue'))
        .then(res => { if(mounted) setJobs(res.data) })
        .catch(() => {}) // ignore errors in background
    }, 5000);
    return () => { mounted = false; clearInterval(poll); };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color:'red'}}>Error: {error}</p>;

  return (
    <div>
      <h2>Current Queue</h2>
      {jobs.length === 0 && <p>No jobs yet.</p>}
      <ul className="queue-list">
        {jobs.map(j => (
          <li key={j.id}>
            <strong>{j.team}</strong>
            <div className="meta">Submitted {new Date(j.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
