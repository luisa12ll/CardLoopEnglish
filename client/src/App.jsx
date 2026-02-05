import { useState, useEffect } from 'react';
import { BookOpen, Plus, Zap, Volume2, MessageSquare, Type, ArrowLeft, Star } from 'lucide-react';
import './App.css';

// --- COMPONENTE DO CARTÃO (FLASHCARD) ---
function FlashcardItem({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Função de Áudio (Text-to-Speech)
  const handleSpeak = (e) => {
    e.stopPropagation(); // Impede que o cartão vire ao clicar no som
    
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = 'en-US'; // Sotaque Americano
    utterance.rate = 1.0; // Velocidade levemente mais lenta para clareza
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className={`card ${isFlipped ? 'virado' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Botão de Som (Só aparece na frente) */}
      {!isFlipped && (
        <button 
          onClick={handleSpeak} 
          className="btn-sound" 
          title="Ouvir pronúncia"
        >
          <Volume2 size={22} />
        </button>
      )}

      <h2>{isFlipped ? card.translation : card.word}</h2>
      
      <span className="dica">
        {isFlipped ? '🔄 Voltar para Inglês' : '👆 Ver Tradução'}
      </span>
    </div>
  );
}

// --- COMPONENTE DA PÁGINA INICIAL (HOME) ---
function HomePage({ onNavigate }) {
  return (
    <div className="home-container">
      
      {/* Bloco Principal que centraliza o conteúdo */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%',
        padding: '20px'
      }}>
        
        <div style={{ marginBottom: '20px' }}>
          <BookOpen size={60} color="#3b82f6" />
        </div>
        
        <h1 className="hero-title">CardLoop English</h1>
        
        <p className="hero-subtitle">
          Domine o inglês técnico e corporativo. O que você quer aprender hoje?
        </p>

        <div className="choice-grid">
          {/* Opção 1: Palavras */}
          <div className="choice-card" onClick={() => onNavigate('words')}>
            <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '50%' }}>
              <Type size={40} color="#3b82f6" />
            </div>
            <h3>Vocabulário</h3>
            <p>Aprenda termos técnicos e palavras-chave.</p>
          </div>

          {/* Opção 2: Frases */}
          <div className="choice-card" onClick={() => onNavigate('phrases')}>
            <div style={{ background: '#f5f3ff', padding: '15px', borderRadius: '50%' }}>
              <MessageSquare size={40} color="#7c3aed" />
            </div>
            <h3>Frases</h3>
            <p>Treine frases completas para reuniões e dailies.</p>
          </div>
        </div>

      </main>
      
      {/* Rodapé fixo no final */}
      <footer className="footer" style={{ border: 'none', paddingBottom: '30px' }}>
        <p>Feito com 💜 por <strong>Luísa de Souza</strong></p>
      </footer>
    </div>
  );
}

// --- APP PRINCIPAL (Gerenciador de Estado) ---
function App() {
  const [cards, setCards] = useState([]);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  
  // Estados possíveis: 'home', 'words', 'phrases'
  const [activeTab, setActiveTab] = useState('home'); 

  // Carrega os dados sempre que mudar a aba (menos na home)
  useEffect(() => {
    if (activeTab !== 'home') {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    const endpoint = activeTab === 'words' ? 'cards' : 'phrases';
    try {
      const response = await fetch(`http://localhost:3001/${endpoint}`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const handleSeed = async () => {
    const endpoint = activeTab === 'words' ? 'seed' : 'seed-phrases';
    await fetch(`http://localhost:3001/${endpoint}`, { method: 'POST' });
    fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word || !translation) return;

    const endpoint = activeTab === 'words' ? 'cards' : 'phrases';
    
    await fetch(`http://localhost:3001/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, translation })
    });

    setWord('');
    setTranslation('');
    fetchData();
  };

  // 1. Se estiver na Home, mostra a Landing Page
  if (activeTab === 'home') {
    return <HomePage onNavigate={setActiveTab} />;
  }

  // 2. Se não, mostra o App de Estudos (Lista de Cards)
  return (
    <div className="container">
      
      {/* Header de Navegação */}
      <header style={{ borderBottom: 'none', marginBottom: '10px' }}>
        <button className="btn-back" onClick={() => setActiveTab('home')}>
          <ArrowLeft size={18} /> Voltar ao Início
        </button>
      </header>

      {/* Header da Aba Atual */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>
              {activeTab === 'words' ? <Type color="#3b82f6" /> : <MessageSquare color="#7c3aed" />}
              {activeTab === 'words' ? 'Vocabulário' : 'Frases Úteis'}
            </h1>
        </div>

        <button onClick={handleSeed} className="btn-seed">
          <Zap size={18} /> Gerar {activeTab === 'words' ? 'Palavras' : 'Frases'}
        </button>
      </header>

      {/* Formulário de Adição */}
      <div className="form-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <input 
            value={word}
            onChange={e => setWord(e.target.value)}
            placeholder={activeTab === 'words' ? "Nova Palavra..." : "Nova Frase Completa..."}
          />
          <input 
            value={translation}
            onChange={e => setTranslation(e.target.value)}
            placeholder="Tradução..."
          />
          <button type="submit" className="btn-add">
            <Plus size={24} />
          </button>
        </form>
      </div>

      {/* Grid de Cards */}
      <div className="card-grid">
        {cards.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <Star size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p>Sua lista está vazia. Clique em <strong>Gerar</strong> ou adicione manualmente!</p>
          </div>
        ) : (
          cards.map((card) => (
            <FlashcardItem key={card.id} card={card} />
          ))
        )}
      </div>

    </div>
  );
}

export default App;