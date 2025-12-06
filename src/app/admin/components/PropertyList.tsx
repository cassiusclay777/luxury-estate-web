'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PropertyListProps {
  properties: any[];
  loading: boolean;
  onEdit: (property: any) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function PropertyList({ properties, loading, onEdit, onDelete, onRefresh }: PropertyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const supabase = createClient();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || property.type === filterType;
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const togglePublished = async (property: any) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ published: !property.published })
        .eq('id', property.id);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error toggling published status:', error);
      alert('Chyba při změně stavu zveřejnění');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Hledat podle názvu, adresy nebo města..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Všechny typy</option>
            <option value="apartment">Byt</option>
            <option value="house">Dům</option>
            <option value="villa">Vila</option>
            <option value="land">Pozemek</option>
            <option value="commercial">Komerční</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Všechny stavy</option>
            <option value="sale">Na prodej</option>
            <option value="rent">K pronájmu</option>
            <option value="sold">Prodáno</option>
          </select>

          <button
            onClick={onRefresh}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Obnovit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Zobrazeno {filteredProperties.length} z {properties.length} nemovitostí
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nemovitost
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lokalita
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cena
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stav
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Žádné nemovitosti nenalezeny
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {property.main_image ? (
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={property.main_image}
                            alt={property.title}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">🏠</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms && `${property.bedrooms} pokojů`}
                          {property.area && ` • ${property.area} m²`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.address}</div>
                    <div className="text-sm text-gray-500">{property.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(property.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.status === 'sale' 
                        ? 'bg-green-100 text-green-800'
                        : property.status === 'rent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status === 'sale' ? 'Na prodej' : 
                       property.status === 'rent' ? 'K pronájmu' : 'Prodáno'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublished(property)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        property.published
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {property.published ? 'Zveřejněno' : 'Skryto'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(property)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => onDelete(property.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <div>
          Typy nemovitostí:&nbsp;
          <span className="font-medium">
            {Array.from(new Set(properties.map(p => p.type))).join(', ')}
          </span>
        </div>
        <div>
          Celková hodnota:&nbsp;
          <span className="font-medium">
            {formatPrice(properties.reduce((sum, p) => sum + (p.price || 0), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
