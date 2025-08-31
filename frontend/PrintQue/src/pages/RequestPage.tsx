import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { apiUrl } from '../api'

const ALLOWED_EXTS = ['.stl', '.obj', '.step', '.stp', '.ply', '.gltf', '.glb', '.fbx', '.dae', '.3ds', '.amf', '.3mf'];

function fileExtOK(filename: string) {
  const ext = filename.toLowerCase().replace(/.*(\.[a-z0-9]+)$/i, '$1');
  return ALLOWED_EXTS.includes(ext);
}

export default function RequestPage() {
  const navigate = useNavigate()
  const [team, setTeam] = useState('')
  const [contact, setContact] = useState('')
  const [comments, setComments] = useState('')
  const [specs, setSpecs] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const minContact = 3

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!file) { setStatus('Please select a file'); return }
    const form = new FormData()
    form.append('team', team)
    form.append('contact', contact)
    if(comments) form.append('comments', comments)
    if(specs) form.append('specs', specs)
    form.append('file', file)
      try {
        setSubmitting(true)
  await axios.post(apiUrl('/queue'), form, { headers: { 'Content-Type': 'multipart/form-data' } })
        setStatus('Submitted! Redirecting...')
        setTimeout(()=> navigate('/'), 600)
      } catch (e: any) {
        if(e.response?.data?.detail) {
          const messages = Array.isArray(e.response.data.detail) ? e.response.data.detail.map((d:any)=> d.msg + (d.loc? ' ('+d.loc.join('.')+')':'')).join('; ') : e.response.data.detail
          setStatus('Validation error: ' + messages)
        } else {
          setStatus('Error: ' + e.message)
        }
      } finally {
        setSubmitting(false)
    }
  }

  return (
    <div>
      <h2>New Print Request</h2>
      <form onSubmit={submit} className="form">
        <label>Team
          <input value={team} onChange={e=>setTeam(e.target.value.replace(/\s+/g,' '))} required minLength={1} />
          {team.trim().length===0 && team.length>0 && <span style={{color:'orange', fontSize:'.7rem'}}>Team cannot be just spaces</span>}
        </label>
        <label>Contact
          <input value={contact} onChange={e=>setContact(e.target.value)} required minLength={minContact} />
          {contact.trim().length>0 && contact.trim().length < minContact && <span style={{color:'orange', fontSize:'.7rem'}}>Need at least {minContact} characters</span>}
        </label>
        <label>Comments<textarea value={comments} onChange={e=>setComments(e.target.value)} /></label>
        <label>Specs<textarea value={specs} onChange={e=>setSpecs(e.target.value)} /></label>
        <label>File
          <input type="file" onChange={e => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            if (f && !fileExtOK(f.name)) {
              setFileError('File type not allowed. Allowed: ' + ALLOWED_EXTS.join(', '));
            } else {
              setFileError(null);
            }
          }} required />
          {file && fileError && <span style={{color:'orange', fontSize:'.7rem'}}>{fileError}</span>}
        </label>
        <button type="submit" disabled={submitting || contact.trim().length < minContact || team.trim().length===0 || !!fileError || !file}> {submitting ? 'Submitting...' : 'Submit'} </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  )
}
