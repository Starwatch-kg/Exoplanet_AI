import React from 'react';
import { Telescope, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="relative z-10 py-6 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Telescope className="w-8 h-8 text-cyan-400 animate-pulse" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-twinkle" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Exoplanet AI
            </h1>
            <p className="text-sm text-slate-400">Искусственный интеллект для поиска экзопланет</p>
          </div>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <a href="#dashboard" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Главная
          </a>
          <a href="#search" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Поиск
          </a>
          <a href="#results" className="text-slate-300 hover:text-cyan-400 transition-colors">
            Результаты
          </a>
          <a href="#about" className="text-slate-300 hover:text-cyan-400 transition-colors">
            О проекте
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
