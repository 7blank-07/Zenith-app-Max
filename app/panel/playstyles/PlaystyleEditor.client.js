'use client';

import { useState } from 'react';
import { updatePlaystyleAction } from '../../actions/panel-actions';

export default function PlaystyleEditor({ initialPlaystyles }) {
  const [playstyles, setPlaystyles] = useState(initialPlaystyles);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (ps) => {
    setEditingId(ps.id);
    setFormData({ ...ps, old_name: ps.name, old_level: ps.level });
    setMessage('');
  };

  const handleSave = async (id) => {
    setLoading(true);
    setMessage('');
    try {
      await updatePlaystyleAction({
        old_name: formData.old_name,
        old_level: formData.old_level,
        name: formData.name,
        description: formData.description,
        icon_url: formData.icon_url
      });
      // Update local state, changing id to new name_level if name changed (usually won't change name but just in case)
      const newId = `${formData.name}_${formData.old_level}`; 
      setPlaystyles(prev => prev.map(p => p.id === id ? { 
        ...p, 
        id: newId,
        name: formData.name, 
        description: formData.description, 
        icon_url: formData.icon_url 
      } : p));
      setEditingId(null);
      setMessage('Successfully updated playstyle and cascaded changes.');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaystyles = playstyles.filter(ps => 
    ps.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {message && <div style={{ padding: '12px', backgroundColor: message.startsWith('Error') ? '#991B1B' : '#065F46', color: 'white', marginBottom: '24px', borderRadius: '6px' }}>{message}</div>}
      
      <div style={{ marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search playstyles..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px', backgroundColor: '#1A1D21', border: '1px solid #333', color: 'white', borderRadius: '8px', fontSize: '16px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {filteredPlaystyles.map((ps) => {
          const isEditing = editingId === ps.id;
          return (
            <div key={ps.id} style={{ backgroundColor: '#1A1D21', border: '1px solid #2A2D31', padding: '24px', borderRadius: '12px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Name</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Level</label>
                    <input 
                      type="text" 
                      value={formData.level || ''} 
                      disabled
                      style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: '#888', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Description</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Icon (URL)</label>
                    <input 
                      type="text" 
                      value={formData.icon_url || ''} 
                      onChange={e => setFormData({...formData, icon_url: e.target.value})}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button onClick={() => handleSave(ps.id)} disabled={loading} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {loading ? 'Saving...' : 'Save & Cascade'}
                    </button>
                    <button onClick={() => setEditingId(null)} disabled={loading} style={{ backgroundColor: '#374151', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>{ps.name} <span style={{ color: '#3B82F6', fontSize: '14px', marginLeft: '8px' }}>({ps.level})</span></h3>
                    <p style={{ color: '#98A0A6', fontSize: '14px', margin: '0 0 16px 0', maxWidth: '800px', lineHeight: '1.5' }}>{ps.description}</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Icon:</span>
                        {ps.icon_url ? <img src={ps.icon_url} alt="Icon" width={32} height={32} /> : <span style={{ color: '#444' }}>None</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleEdit(ps)} style={{ backgroundColor: '#2563EB', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
