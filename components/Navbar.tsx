
import React from 'react';
import { Page } from '../types';
import { UploadIcon, FileTextIcon, CogIcon, LogoutIcon, HelpIcon, SunIcon, MoonIcon } from './icons';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onShowGuide: () => void;
  userName: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 text-left ${
      isActive
        ? 'bg-accent text-white'
        : 'text-text-secondary hover:bg-primary dark:hover:bg-[#0D1117] hover:text-text-primary dark:hover:text-[#C9D1D9]'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onLogout, onShowGuide, userName, theme, onToggleTheme }) => {
  return (
    <nav className="bg-secondary dark:bg-[#161B22] border-r border-border-color dark:border-[#30363D] w-64 p-4 flex flex-col flex-shrink-0">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-text-primary dark:text-[#C9D1D9]">DocuDigitize AI</h1>
        <p className="text-xs text-text-secondary/60 dark:text-[#8B949E]/60 mt-1">v1.1.0</p>
      </div>
      <div className="flex flex-col space-y-2 flex-grow">
        <NavItem
          icon={<UploadIcon className="w-5 h-5" />}
          label="Ανέβασμα"
          isActive={currentPage === 'upload'}
          onClick={() => onNavigate('upload')}
        />
        <NavItem
          icon={<FileTextIcon className="w-5 h-5" />}
          label="Αρχεία Κειμένου"
          isActive={currentPage === 'files'}
          onClick={() => onNavigate('files')}
        />
        <NavItem
          icon={<CogIcon className="w-5 h-5" />}
          label="Ρυθμίσεις"
          isActive={currentPage === 'settings'}
          onClick={() => onNavigate('settings')}
        />
        <NavItem
          icon={<HelpIcon className="w-5 h-5" />}
          label="Βοήθεια"
          isActive={false}
          onClick={onShowGuide}
        />
      </div>
      <div className="mt-auto pt-4 border-t border-border-color dark:border-[#30363D] space-y-4">
        <div className="flex justify-center">
          <button onClick={onToggleTheme} className="p-2 rounded-full text-text-secondary hover:bg-primary dark:hover:bg-[#0D1117] transition-colors">
            {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
        <div className='text-center px-2'>
            <span className="text-sm text-text-secondary dark:text-[#8B949E] break-words">{userName}</span>
        </div>
        <div>
            <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-text-secondary dark:text-[#8B949E] hover:bg-red-600 hover:text-white transition-colors duration-200"
            >
            <LogoutIcon className="w-5 h-5" />
            <span className="ml-2">Έξοδος</span>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
