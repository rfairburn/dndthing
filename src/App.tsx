import { useState } from 'react';
import CharacterGenerator from './components/CharacterGenerator';
import ReferenceLibrary from './components/ReferenceLibrary';
import './App.css';

function App() {
  const [view, setView] = useState<'generator' | 'reference'>('generator');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-900 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center mb-2">D&D 2024 SRD Character Generator</h1>
          <p className="text-center text-purple-200 text-lg">Create and manage your characters with the latest ruleset</p>
          
          {/* Navigation */}
          <nav className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setView('generator')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                view === 'generator'
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Character Generator
            </button>
            <button
              onClick={() => setView('reference')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                view === 'reference'
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Reference Library
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'generator' ? (
          <CharacterGenerator />
        ) : (
          <ReferenceLibrary />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-center py-6 mt-12">
        <p className="text-gray-400">D&D 2024 SRD Character Generator - Built with React & Tailwind CSS</p>
        <p className="text-gray-500 text-sm mt-2">Based on the System Reference Document (SRD) ruleset</p>
      </footer>
    </div>
  );
}

export default App;
