import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [annonces, setAnnonces] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingAnnonces, setLoadingAnnonces] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inboxPseudo, setInboxPseudo] = useState('');

  const [annonceFormOpen, setAnnonceFormOpen] = useState(false);
  const [messageFormOpen, setMessageFormOpen] = useState(false);

  const [annonceForm, setAnnonceForm] = useState({
    type: '',
    objet: '',
    contenu: '',
    lieu_annonce: '',
    user_pseudo: '',
    date_fin: ''
  });

  const [messageForm, setMessageForm] = useState({
    sender_pseudo: '',
    receiver_pseudo: '',
    contenu: '',
    annonce_id: ''
  });

  const [annonceError, setAnnonceError] = useState('');
  const [messageError, setMessageError] = useState('');

  useEffect(() => {
    chargerAnnonces();
  }, []);

  const chargerAnnonces = async () => {
    try {
      setLoadingAnnonces(true);
      const res = await fetch('/api1/annonces');
      if (!res.ok) {
        throw new Error(`Erreur API 1 (${res.status})`);
      }
      const data = await res.json();
      setAnnonces(data);
    } catch (err) {
      console.error('Erreur API 1:', err);
      setAnnonceError('Impossible de charger les annonces pour le moment.');
    } finally {
      setLoadingAnnonces(false);
    }
  };

  const chargerMessages = async () => {
    const pseudo = inboxPseudo.trim();
    if (!pseudo) {
      setMessageError('Saisissez un pseudo pour charger la boîte de réception.');
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      setMessageError('');
      const res = await fetch(`/api2/messages/inbox/${encodeURIComponent(pseudo)}`);
      if (!res.ok) {
        throw new Error(`Erreur API 2 (${res.status})`);
      }
      const payload = await res.json();
      setMessages(payload.data ?? []);
    } catch (err) {
      console.error('Erreur API 2:', err);
      setMessageError('Impossible de charger les messages pour ce pseudo.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleAnnonceSubmit = async (event) => {
    event.preventDefault();
    setAnnonceError('');

    const payload = {
      type: annonceForm.type.trim(),
      objet: annonceForm.objet.trim(),
      contenu: annonceForm.contenu.trim(),
      lieu_annonce: annonceForm.lieu_annonce.trim(),
      user_pseudo: annonceForm.user_pseudo.trim(),
    };

    if (annonceForm.date_fin) {
      payload.date_fin = new Date(annonceForm.date_fin).toISOString();
    }

    try {
      const res = await fetch('/api1/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.detail || `Erreur API 1 (${res.status})`);
      }

      const created = await res.json();
      setAnnonces(prev => [created, ...prev]);
      setAnnonceForm({
        type: '',
        objet: '',
        contenu: '',
        lieu_annonce: '',
        user_pseudo: '',
        date_fin: ''
      });
      setAnnonceFormOpen(false);
    } catch (err) {
      setAnnonceError(err.message || 'Erreur lors de la création de l\'annonce.');
    }
  };

  const handleMessageSubmit = async (event) => {
    event.preventDefault();
    setMessageError('');

    const sender = messageForm.sender_pseudo.trim();
    const receiver = messageForm.receiver_pseudo.trim();
    if (sender === receiver) {
      setMessageError('Expéditeur et destinataire doivent être différents.');
      return;
    }

    const payload = {
      sender_pseudo: sender,
      receiver_pseudo: receiver,
      contenu: messageForm.contenu.trim(),
    };

    if (messageForm.annonce_id.trim()) {
      payload.annonce_id = messageForm.annonce_id.trim();
    }

    try {
      const res = await fetch('/api2/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.detail || `Erreur API 2 (${res.status})`);
      }

      const created = await res.json();
      if (created.receiver_pseudo === inboxPseudo.trim()) {
        setMessages(prev => [created, ...prev]);
      }

      setMessageForm({
        sender_pseudo: '',
        receiver_pseudo: '',
        contenu: '',
        annonce_id: ''
      });
      setMessageFormOpen(false);
    } catch (err) {
      setMessageError(err.message || 'Erreur lors de l\'envoi du message.');
    }
  };

  if (loadingAnnonces) {
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
          <div className="section-head">
            <h2>📦 Objets à donner</h2>
            <button
              type="button"
              className="action-btn"
              onClick={() => setAnnonceFormOpen(prev => !prev)}
            >
              {annonceFormOpen ? 'Fermer' : 'Ajouter une annonce'}
            </button>
          </div>

          {annonceFormOpen && (
            <form className="form-card" onSubmit={handleAnnonceSubmit}>
              <input
                required
                type="text"
                placeholder="Type (don, echange, etc.)"
                value={annonceForm.type}
                onChange={(e) => setAnnonceForm(prev => ({ ...prev, type: e.target.value }))}
              />
              <input
                required
                type="text"
                placeholder="Objet"
                value={annonceForm.objet}
                onChange={(e) => setAnnonceForm(prev => ({ ...prev, objet: e.target.value }))}
              />
              <textarea
                required
                placeholder="Contenu de l'annonce"
                value={annonceForm.contenu}
                onChange={(e) => setAnnonceForm(prev => ({ ...prev, contenu: e.target.value }))}
              />
              <input
                required
                type="text"
                placeholder="Lieu"
                value={annonceForm.lieu_annonce}
                onChange={(e) => setAnnonceForm(prev => ({ ...prev, lieu_annonce: e.target.value }))}
              />
              <input
                required
                type="text"
                placeholder="Pseudo utilisateur"
                value={annonceForm.user_pseudo}
                onChange={(e) => setAnnonceForm(prev => ({ ...prev, user_pseudo: e.target.value }))}
              />
              <input
                type="datetime-local"
                value={annonceForm.date_fin}
                onChange={(e) => setAnnonceForm(prev => ({ ...prev, date_fin: e.target.value }))}
              />
              <button type="submit" className="submit-btn">Publier l'annonce</button>
            </form>
          )}

          {annonceError && <p className="error">{annonceError}</p>}

          {annonces.map((annonce) => (
            <div key={annonce.id} className="card">
              <h3>{annonce.objet}</h3>
              <p>{annonce.contenu}</p>
              <div className="meta">
                <span>🏷️ {annonce.type}</span>
                <span>📍 {annonce.lieu_annonce}</span>
                <span>👤 {annonce.user_pseudo}</span>
                <span>🕒 {new Date(annonce.date_post).toLocaleString('fr-FR')}</span>
                {annonce.date_fin && (
                  <span>⏳ Fin: {new Date(annonce.date_fin).toLocaleString('fr-FR')}</span>
                )}
              </div>
            </div>
          ))}
          {annonces.length === 0 && <p className="empty">Aucune annonce disponible</p>}
        </section>

        {/* Section Messages - API 2 */}
        <section className="messages">
          <div className="section-head">
            <h2>💬 Messages</h2>
            <button
              type="button"
              className="action-btn"
              onClick={() => setMessageFormOpen(prev => !prev)}
            >
              {messageFormOpen ? 'Fermer' : 'Envoyer un message'}
            </button>
          </div>

          <div className="inbox-tools">
            <input
              type="text"
              placeholder="Pseudo de la boite de reception"
              value={inboxPseudo}
              onChange={(e) => setInboxPseudo(e.target.value)}
            />
            <button type="button" className="secondary-btn" onClick={chargerMessages}>
              Charger la boite
            </button>
          </div>

          {messageFormOpen && (
            <form className="form-card" onSubmit={handleMessageSubmit}>
              <input
                required
                type="text"
                placeholder="Pseudo expéditeur"
                value={messageForm.sender_pseudo}
                onChange={(e) => setMessageForm(prev => ({ ...prev, sender_pseudo: e.target.value }))}
              />
              <input
                required
                type="text"
                placeholder="Pseudo destinataire"
                value={messageForm.receiver_pseudo}
                onChange={(e) => setMessageForm(prev => ({ ...prev, receiver_pseudo: e.target.value }))}
              />
              <textarea
                required
                placeholder="Votre message"
                value={messageForm.contenu}
                onChange={(e) => setMessageForm(prev => ({ ...prev, contenu: e.target.value }))}
              />
              <input
                type="text"
                placeholder="ID annonce (optionnel)"
                value={messageForm.annonce_id}
                onChange={(e) => setMessageForm(prev => ({ ...prev, annonce_id: e.target.value }))}
              />
              <button type="submit" className="submit-btn">Envoyer le message</button>
            </form>
          )}

          {loadingMessages && <p className="info">Chargement des messages...</p>}
          {messageError && <p className="error">{messageError}</p>}

          {messages.map((msg) => (
            <div key={msg.id} className="card">
              <div className="message-header">
                <strong>{msg.sender_pseudo}</strong> → {msg.receiver_pseudo}
              </div>
              {msg.annonce_id && <p className="message-subject">Annonce liée: {msg.annonce_id}</p>}
              <p>{msg.contenu}</p>
              <span className="timestamp">{new Date(msg.date_envoi).toLocaleString('fr-FR')}</span>
            </div>
          ))}
          {messages.length === 0 && <p className="empty">Aucun message</p>}
        </section>
      </main>
    </div>
  );
}

export default App;


