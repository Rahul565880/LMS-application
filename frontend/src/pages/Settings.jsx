import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatar: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const res = await authService.updateProfile(formData);
            updateUser(res.data.user);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <div className="container" style={{ padding: '40px 0' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '40px 0', maxWidth: '600px' }}>
            <h1>Profile Settings</h1>
            <p className="section-subtitle" style={{ marginBottom: '24px' }}>Update your account details below.</p>

            {message && <div className="badge badge-success" style={{ display: 'block', padding: '12px', marginBottom: '20px' }}>{message}</div>}
            {error && <div className="badge badge-warning" style={{ display: 'block', padding: '12px', marginBottom: '20px', backgroundColor: 'var(--error)' }}>{error}</div>}

            <div className="card" style={{ padding: '24px' }}>
                <form onSubmit={handleSubmit} className="grid">
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Profile Image URL (Optional)</label>
                        <input
                            type="url"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                            className="input"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Bio (Optional)</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="input"
                            rows="4"
                            placeholder="Tell us a little about yourself"
                        ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
