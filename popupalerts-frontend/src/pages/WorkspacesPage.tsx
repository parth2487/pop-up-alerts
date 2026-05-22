// popupalerts-frontend/src/pages/WorkspacesPage.tsx

import { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom'; // <-- Pastikan Link diimpor dari react-router-dom

// Definisikan tipe data untuk sebuah workspace
interface Workspace {
  id: string;
  name: string;
  domain: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log("Hello bhai how are you???")
    const fetchWorkspaces = async () => {
      try {
        setError('');
        setLoading(true);
        const response = await apiClient.get('/workspaces');
        setWorkspaces(response.data);
      } catch (err) {
        setError('Failed to fetch workspaces. Please try logging in again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/workspaces', {
        name: newName,
        domain: newDomain,
      });
      setWorkspaces(prev => [...prev, response.data]);
      setNewName('');
      setNewDomain('');
    } catch (err) {
      setError('Failed to create workspace.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8">Loading workspaces...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Workspaces</h1>

      {/* Form untuk membuat workspace baru */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>
        <form onSubmit={handleCreateWorkspace} className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Workspace Name</label>
            <input type="text" id="name" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div className="flex-1">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain</label>
            <input type="text" id="domain" value={newDomain} onChange={e => setNewDomain(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Create</button>
        </form>
      </div>

      {/* Daftar workspace yang sudah ada */}
      <div className="space-y-4">
        {workspaces.length > 0 ? (
          workspaces.map(ws => (
            // --- PERUBAHAN UTAMA DI SINI ---
            // div diubah menjadi komponen Link agar bisa diklik
            <Link 
              to={`/workspace/${ws.id}`} 
              key={ws.id} 
              className="block p-4 bg-white rounded-lg shadow flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-lg">{ws.name}</p>
                <p className="text-gray-500 text-sm">{ws.domain}</p>
              </div>
              <span className="text-gray-400">&rarr;</span>
            </Link>
            // -----------------------------
          ))
        ) : (
          <p>You don't have any workspaces yet. Create one above!</p>
        )}
      </div>
    </div>
  );
}
