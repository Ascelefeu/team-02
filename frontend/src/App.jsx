import { useState, useEffect } from 'react';
import './App.css';

const SESSION_STORAGE_KEY = 'rq-auth-session';

const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const getApiError = async (response, fallbackMessage) => {
  const body = await response.json().catch(() => null);

  if (body && typeof body.detail === 'string' && body.detail.trim()) {
    return body.detail;
  }

  if (body && Array.isArray(body.detail) && body.detail.length > 0) {
    const firstDetail = body.detail[0];
    if (firstDetail && typeof firstDetail.msg === 'string' && firstDetail.msg.trim()) {
      return firstDetail.msg;
    }
  }

  return fallbackMessage;
};

function App() {
  const [session, setSession] = useState(() => getStoredSession());
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    pseudo: '',
    password: '',
    confirmPassword: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');

  const [annonces, setAnnonces] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

  const currentUser = session?.user ?? null;
  const connectedPseudo = currentUser?.pseudo ?? '';
  const isAuthenticated = Boolean(currentUser && session?.access_token);

  const saveSession = (nextSession) => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setMessages([]);
    setUnreadCount(0);
    setInboxPseudo('');
    setMessageForm({
      sender_pseudo: '',
      receiver_pseudo: '',
      contenu: '',
      annonce_id: ''
    });
  };

  useEffect(() => {
    chargerAnnonces();
  }, []);

  useEffect(() => {
    if (!connectedPseudo) {
      return;
    }

    setInboxPseudo(connectedPseudo);
    setMessageForm((prev) => ({ ...prev, sender_pseudo: connectedPseudo }));
    chargerMessages(connectedPseudo);
  }, [connectedPseudo]);

  const chargerAnnonces = async () => {
    try {
      setLoadingAnnonces(true);
      setAnnonceError('');
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

  const chargerMessages = async (forcedPseudo = '') => {
    const pseudo = (forcedPseudo || connectedPseudo || inboxPseudo).trim();
    if (!pseudo) {
      setMessageError('Connectez-vous pour charger votre boîte de réception.');
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
      setUnreadCount(payload.unread_count ?? 0);
      setInboxPseudo(pseudo);
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

    const pseudoAnnonce = isAuthenticated
      ? connectedPseudo
      : annonceForm.user_pseudo.trim();

    const payload = {
      type: annonceForm.type.trim(),
      objet: annonceForm.objet.trim(),
      contenu: annonceForm.contenu.trim(),
      lieu_annonce: annonceForm.lieu_annonce.trim(),
      user_pseudo: pseudoAnnonce,
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
        user_pseudo: isAuthenticated ? connectedPseudo : '',
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

    if (!isAuthenticated) {
      setMessageError('Vous devez être connecté pour envoyer un message.');
      return;
    }

    const sender = connectedPseudo;
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
      if (created.receiver_pseudo === connectedPseudo) {
        setMessages(prev => [created, ...prev]);
      }

      setMessageForm({
        sender_pseudo: connectedPseudo,
        receiver_pseudo: '',
        contenu: '',
        annonce_id: ''
      });
      setMessageFormOpen(false);
    } catch (err) {
      setMessageError(err.message || 'Erreur lors de l\'envoi du message.');
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthInfo('');

    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;

    if (!email || !password) {
      setAuthError('Email et mot de passe sont obligatoires.');
      return;
    }

    try {
      setAuthLoading(true);

      if (authMode === 'register') {
        const pseudo = authForm.pseudo.trim();
        if (!pseudo) {
          setAuthError('Le pseudo est obligatoire.');
          return;
        }
        if (pseudo.length < 3) {
          setAuthError('Le pseudo doit contenir au moins 3 caracteres.');
          return;
        }
        if (password.length < 8) {
          setAuthError('Le mot de passe doit contenir au moins 8 caracteres.');
          return;
        }
        if (authForm.password !== authForm.confirmPassword) {
          setAuthError('La confirmation du mot de passe ne correspond pas.');
          return;
        }

        const registerRes = await fetch('/api2/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, pseudo, password })
        });

        if (!registerRes.ok) {
          const registerError = await getApiError(registerRes, 'Inscription impossible.');
          throw new Error(registerError);
        }

        setAuthInfo('Compte créé avec succès. Connexion en cours...');
      }

      const loginRes = await fetch('/api2/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!loginRes.ok) {
        const loginError = await getApiError(loginRes, 'Connexion impossible.');
        throw new Error(loginError);
      }

      const loggedSession = await loginRes.json();
      saveSession(loggedSession);

      setAuthForm({
        email: '',
        pseudo: '',
        password: '',
        confirmPassword: ''
      });
      setMessageForm((prev) => ({ ...prev, sender_pseudo: loggedSession.user.pseudo }));
      setAnnonceForm((prev) => ({ ...prev, user_pseudo: loggedSession.user.pseudo }));
      setAuthMode('login');
      setAuthInfo(`Connecté en tant que ${loggedSession.user.pseudo}.`);
    } catch (err) {
      setAuthError(err.message || 'Erreur d\'authentification.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setAuthInfo('Déconnexion effectuée.');
  };

  if (loadingAnnonces) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>♻️ Recyclage de Quartier</h1>
        <p>
          {isAuthenticated
            ? `Connecté: ${connectedPseudo}`
            : 'Non connecté'}
        </p>
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
              {isAuthenticated ? (
                <div className="readonly-field">Annonce publiée par: {connectedPseudo}</div>
              ) : (
                <input
                  required
                  type="text"
                  placeholder="Pseudo utilisateur"
                  value={annonceForm.user_pseudo}
                  onChange={(e) => setAnnonceForm(prev => ({ ...prev, user_pseudo: e.target.value }))}
                />
              )}
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
            <h2>🔐 Authentification & messagerie</h2>
            {isAuthenticated && (
              <button type="button" className="secondary-btn" onClick={handleLogout}>
                Déconnexion
              </button>
            )}
          </div>

          <div className="form-card auth-panel">
            {!isAuthenticated && (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                >
                  Inscription
                </button>
              </div>
            )}

            {!isAuthenticated ? (
              <form onSubmit={handleAuthSubmit} className="auth-form">
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                {authMode === 'register' && (
                  <input
                    required
                    type="text"
                    minLength={3}
                    maxLength={50}
                    placeholder="Pseudo"
                    value={authForm.pseudo}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, pseudo: e.target.value }))}
                  />
                )}
                <input
                  required
                  type="password"
                  minLength={8}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Mot de passe"
                  value={authForm.password}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                {authMode === 'register' && (
                  <input
                    required
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Confirmer le mot de passe"
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                )}
                <button type="submit" className="submit-btn" disabled={authLoading}>
                  {authLoading
                    ? 'Veuillez patienter...'
                    : authMode === 'login'
                      ? 'Se connecter'
                      : 'Créer le compte'}
                </button>
              </form>
            ) : (
              <div className="auth-connected">
                <p><strong>Pseudo:</strong> {connectedPseudo}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Non lus:</strong> {unreadCount}</p>
                <button type="button" className="secondary-btn" onClick={() => chargerMessages(connectedPseudo)}>
                  Rafraîchir ma boîte
                </button>
              </div>
            )}

            {authInfo && <p className="info">{authInfo}</p>}
            {authError && <p className="error">{authError}</p>}
          </div>

          {!isAuthenticated && (
            <p className="info">Connectez-vous pour afficher votre messagerie et envoyer des messages.</p>
          )}

          {isAuthenticated && (
            <>
              <div className="inbox-tools">
                <div className="readonly-field">Boîte de réception de: {inboxPseudo}</div>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setMessageFormOpen(prev => !prev)}
                >
                  {messageFormOpen ? 'Fermer' : 'Envoyer un message'}
                </button>
              </div>

              {messageFormOpen && (
                <form className="form-card" onSubmit={handleMessageSubmit}>
                  <div className="readonly-field">Expéditeur: {connectedPseudo}</div>
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
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;


