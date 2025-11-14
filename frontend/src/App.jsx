import { useEffect, useState } from 'react'

function App() {
  const [msg, setMsg] = useState('Carregando...')

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")     // PORTA DO SEU BACKEND
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(err => setMsg("Erro ao conectar com o backend"))
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>📚 BookTrack</h1>
      <p>{msg}</p>
    </div>
  )
}

export default App

