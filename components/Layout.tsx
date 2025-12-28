
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen nebula-bg flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl mb-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl">
            ✧
          </div>
          <h1 className="text-3xl font-cinzel font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-100">
            ZODIAC GEMINI
          </h1>
        </div>
      </header>
      <main className="w-full max-w-6xl">
        {children}
      </main>
      <footer className="mt-20 py-8 border-t border-white/10 w-full max-w-6xl text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Zodiac Gemini - Yıldızlar Sizinle Olsun</p>
        <p className="mt-2">Gemini 3 Intelligence tarafından desteklenmektedir.</p>
      </footer>
    </div>
  );
};

export default Layout;
