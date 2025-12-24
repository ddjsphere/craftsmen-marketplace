import { useState } from 'react';
import { createArtwork, updateArtwork, deleteArtwork } from '../utils/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface ArtworkManagerProps {
  artworks: any[];
  onUpdate: () => void;
}

export function ArtworkManager({ artworks, onUpdate }: ArtworkManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'pottery',
    image: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'pottery', label: 'Pottery' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'wood', label: 'Wood Carving' },
    { value: 'baskets', label: 'Baskets' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'paintings', label: 'Paintings' }
  ];

  const handleEdit = (artwork: any) => {
    setEditingArtwork(artwork);
    setFormData({
      title: artwork.title,
      description: artwork.description,
      price: artwork.price.toString(),
      category: artwork.category,
      image: artwork.image,
      location: artwork.location || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
      await deleteArtwork(artworkId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      alert('Failed to delete artwork');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const artworkData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingArtwork) {
        await updateArtwork(editingArtwork.id, artworkData);
      } else {
        await createArtwork(artworkData);
      }

      setShowForm(false);
      setEditingArtwork(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'pottery',
        image: '',
        location: ''
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving artwork:', error);
      alert('Failed to save artwork');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArtwork(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'pottery',
      image: '',
      location: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-gray-900">My Artworks</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Add Artwork
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <h3 className="text-xl text-gray-900 mb-4">
              {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
            </h3>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="City, Country"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingArtwork ? 'Update Artwork' : 'Add Artwork'}
              </button>
            </div>
          </form>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't added any artworks yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Add Your First Artwork
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg text-gray-900 mb-2">{artwork.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-orange-600">${artwork.price}</span>
                    <span className="text-sm text-gray-500 capitalize">{artwork.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(artwork)}
                      className="flex-1 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="flex-1 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
