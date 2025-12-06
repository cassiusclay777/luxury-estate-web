'use client';

import { useState, useEffect } from 'react';
import { PropertyForm } from './components/PropertyForm';
import { PropertyList } from './components/PropertyList';
import { UploadImages } from './components/UploadImages';
import { createClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit' | 'upload'>('list');

  const [supabase] = useState(() => createClient());

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property: any) => {
    setSelectedProperty(property);
    setActiveTab('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto nemovitost?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProperties(properties.filter(p => p.id !== id));
      alert('Nemovitost byla úspěšně smazána');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Chyba při mazání nemovitosti');
    }
  };

  const handleSuccess = () => {
    fetchProperties();
    setActiveTab('list');
    setSelectedProperty(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel - Správa nemovitostí</h1>
          <p className="mt-2 text-gray-600">
            Spravujte nemovitosti, přidávejte nové a upravujte existující
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('list');
                  setSelectedProperty(null);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Seznam nemovitostí
              </button>
              <button
                onClick={() => {
                  setActiveTab('add');
                  setSelectedProperty(null);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'add'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Přidat novou
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nahrát fotky
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'list' && (
              <PropertyList
                properties={properties}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={fetchProperties}
              />
            )}

            {activeTab === 'add' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Přidat novou nemovitost</h2>
                <PropertyForm onSuccess={handleSuccess} />
              </div>
            )}

            {activeTab === 'edit' && selectedProperty && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Upravit nemovitost: {selectedProperty.title}
                </h2>
                <PropertyForm
                  property={selectedProperty}
                  onSuccess={handleSuccess}
                />
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Nahrát fotky</h2>
                <UploadImages onSuccess={handleSuccess} />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🏠</span>
                  </div>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Celkem nemovitostí</div>
                  <div className="text-2xl font-semibold text-gray-900">{properties.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-lg">💰</span>
                  </div>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Na prodej</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {properties.filter(p => p.status === 'sale').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">📈</span>
                  </div>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">K pronájmu</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {properties.filter(p => p.status === 'rent').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Prodáno</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {properties.filter(p => p.status === 'sold').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
