import { useState } from 'react';
import { createArtisan, updateArtisan } from '../../utils/api';
import { Save } from 'lucide-react';

interface ArtisanProfileManagerProps {
  artisan: any;
  onUpdate: () => void;
}

export function ArtisanProfileManager({ artisan, onUpdate }: ArtisanProfileManagerProps) {
  const [formData, setFormData] = useState({
    name: artisan?.name || '',
    location: artisan?.location || '',
    specialty: artisan?.specialty || '',
    description: artisan?.description || '',
    image: artisan?.image || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (artisan) {
        await updateArtisan(artisan.id, formData);
      } else {
        await createArtisan(formData);
      }
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl text-gray-900">Artisan Profile</h2>
        <p className="text-gray-600 mt-1">Manage your public artisan profile</p>
      </div>

      <div className="p-6">
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Specialty</label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Wood Carving, Pottery, Textile Weaving"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">About Me</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              placeholder="Tell buyers about your craft, experience, and what makes your work unique..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Profile Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://example.com/profile-image.jpg"
              required
            />
            {formData.image && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={formData.image}
                  alt="Profile preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
