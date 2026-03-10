import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [annonces, setAnnonces] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Appel à l'API 1 pour les annonces
    fetch('/api1/annonces')
      .then(res => res.json())
      .then(data => setAnnonces(data))
      .catch(err => console.error('Erreur API 1:', err));

    // Appel à l'API 2 pour les messages
    fetch('/api2/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Erreur API 2:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>♻️ Recyclage de Quartier</h1>
      </header>

      <main>
        {/* Section Annonces - API 1 */}
        <section className="annonces">
          <h2>📦 Objets à donner</h2>
          {annonces.map((annonce) => (
            <div key={annonce._id} className="card">
              <h3>{annonce.title}</h3>
              <p>{annonce.description}</p>
              <div className="meta">
                <span>📍 {annonce.location}</span>
                <span>👤 {annonce.donateur}</span>
                <span className={`status ${annonce.status}`}>{annonce.status}</span>
              </div>
            </div>
          ))}
          {annonces.length === 0 && <p className="empty">Aucune annonce disponible</p>}
        </section>

        {/* Section Messages - API 2 */}
        <section className="messages">
          <h2>💬 Messages</h2>
          {messages.map((msg) => (
            <div key={msg._id} className="card">
              <div className="message-header">
                <strong>{msg.sender}</strong> → {msg.receiver}
              </div>
              <p className="message-subject">Re: {msg.annonceTitle}</p>
              <p>{msg.message}</p>
              <span className="timestamp">{new Date(msg.timestamp).toLocaleString('fr-FR')}</span>
            </div>
          ))}
          {messages.length === 0 && <p className="empty">Aucun message</p>}
        </section>
      </main>
    </div>
  );
}

export default App;


