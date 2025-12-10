'use client';

import { useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

interface PropertyFormProps {
  property?: any;
  onSuccess: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || '',
    address: property?.address || '',
    city: property?.city || '',
    bedrooms: property?.bedrooms || '',
    bathrooms: property?.bathrooms || '',
    area: property?.area || '',
    type: property?.type || 'apartment',
    status: property?.status || 'sale',
    published: property?.published ?? true,
    features: property?.features?.join(', ') || '',
    images: property?.images?.join('\n') || '',
    lat: property?.lat || '',
    lng: property?.lng || '',
  });

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price.toString()),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms.toString()) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms.toString()) : null,
        area: formData.area ? parseFloat(formData.area.toString()) : null,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        features: formData.features.split(',').map((f: string) => f.trim()).filter(Boolean),
        images: formData.images.split('\n').map((url: string) => url.trim()).filter(Boolean),
      };

      if (property) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);

        if (error) throw error;
        alert('Nemovitost byla úspěšně aktualizována');
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (error) throw error;
        alert('Nemovitost byla úspěšně vytvořena');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Chyba při ukládání nemovitosti');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Basic Info */}
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Název nemovitosti *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Popis *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Cena (Kč) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Typ nemovitosti *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="apartment">Byt</option>
            <option value="house">Dům</option>
            <option value="villa">Vila</option>
            <option value="land">Pozemek</option>
            <option value="commercial">Komerční</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Adresa *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Město *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Property Details */}
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
            Počet pokojů
          </label>
          <input
            type="number"
            id="bedrooms"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
            Počet koupelen
          </label>
          <input
            type="number"
            id="bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Plocha (m²)
          </label>
          <input
            type="number"
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="sale">Na prodej</option>
            <option value="rent">K pronájmu</option>
            <option value="sold">Prodáno</option>
          </select>
        </div>

        {/* Coordinates */}
        <div>
          <label htmlFor="lat" className="block text-sm font-medium text-gray-700">
            Zeměpisná šířka
          </label>
          <input
            type="number"
            step="any"
            id="lat"
            name="lat"
            value={formData.lat}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="lng" className="block text-sm font-medium text-gray-700">
            Zeměpisná délka
          </label>
          <input
            type="number"
            step="any"
            id="lng"
            name="lng"
            value={formData.lng}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Features */}
        <div className="sm:col-span-2">
          <label htmlFor="features" className="block text-sm font-medium text-gray-700">
            Vlastnosti (oddělené čárkou)
          </label>
          <input
            type="text"
            id="features"
            name="features"
            value={formData.features}
            onChange={handleChange}
            placeholder="terasa, garáž, bazén, klimatizace"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Images */}
        <div className="sm:col-span-2">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            URL obrázků (jedno URL na řádek) *
          </label>
          <textarea
            id="images"
            name="images"
            rows={4}
            required
            value={formData.images}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&#10;https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Published */}
        <div className="sm:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Zveřejnit nemovitost
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Ukládání...' : property ? 'Aktualizovat' : 'Vytvořit'}
        </button>
      </div>
    </form>
  );
}
