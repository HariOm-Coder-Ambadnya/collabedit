import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import EditorPage from './pages/EditorPage.jsx';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('collabedit-dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('collabedit-dark', darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/doc/:id" element={<EditorPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
