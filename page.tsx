
"use client";

import React, { useEffect, useState } from 'react';
import App from './App';
import AdminApp from './AdminApp';

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detectar si estamos en modo admin
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.get('admin') === 'true');
    setMounted(true);
  }, []);

  // Evitar errores de carga inicial
  if (!mounted) return <div className="min-h-screen bg-white"></div>;

  return (
    <main>
      {isAdmin ? <AdminApp /> : <App />}
    </main>
  );
}
