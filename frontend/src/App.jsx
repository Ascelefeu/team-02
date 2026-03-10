import { useState, useEffect } from 'react'

function App() {
  // État pour les annonces (API 1)
  const [annonces, setAnnonces] = useState([]);
  // État pour la messagerie (API 2)
  const [messages, setMessages] = useState([]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🌍 Recyclage de Quartier</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* SECTION API 1 : ANNONCES */}
        <section style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h2>📦 Objets à donner (API 1)</h2>
          <form style={{ marginBottom: '20px' }}>
            <input type="text" placeholder="Nom de l'objet" />
            <button type="submit">Poster</button>
          </form>
          <ul>
            {annonces.map((item, i) => <li key={i}>{item.name}</li>)}
            {annonces.length === 0 && <p>Aucune annonce pour le moment.</p>}
          </ul>
        </section>

        {/* SECTION API 2 : MESSAGERIE */}
        <section style={{ border: '1px solid #ccc', padding: '15px' }}>
          <h2>💬 Messagerie (API 2)</h2>
          <div style={{ height: '200px', overflowY: 'scroll', background: '#f9f9f9', marginBottom: '10px' }}>
             {/* Les messages s'afficheront ici */}
          </div>
          <input type="text" placeholder="Votre message..." />
          <button>Envoyer</button>
        </section>

      </div>
    </div>
  )
}

export default App