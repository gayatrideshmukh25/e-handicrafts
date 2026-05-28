import React, { useState } from 'react';
import { FiUser, FiLock, FiMapPin } from 'react-icons/fi';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [pf, setPf] = useState({ name: user?.name||'', phone: user?.phone||'', street: user?.address?.street||'', city: user?.address?.city||'', state: user?.address?.state||'', pincode: user?.address?.pincode||'' });
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', pf.name); fd.append('phone', pf.phone);
      fd.append('address', JSON.stringify({ street: pf.street, city: pf.city, state: pf.state, pincode: pf.pincode }));
      await updateProfile(fd); await refreshUser(); toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pw.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setSaving(true);
    try { await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }); toast.success('Password changed!'); setPw({ currentPassword:'', newPassword:'', confirmPassword:'' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-h)', background: 'var(--surface-2)', minHeight: '100vh' }}>
        <div className="container profile-page fade-in">
          <div className="profile-hero">
            <div className="profile-av">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-red' : user?.role === 'seller' ? 'badge-gold' : 'badge-blue'}`}>{user?.role}</span>
            </div>
          </div>

          <div className="profile-tabs">
            <button className={`profile-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><FiUser /> Profile</button>
            <button className={`profile-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}><FiLock /> Password</button>
          </div>

          {tab === 'profile' && (
            <div className="profile-form-card">
              <h2>Personal Information</h2>
              <form onSubmit={handleProfileSave}>
                <div className="form-row-2">
                  <div className="form-group"><label>Full Name</label><input className="form-control" value={pf.name} onChange={e => setPf({...pf, name: e.target.value})} /></div>
                  <div className="form-group"><label>Phone</label><input className="form-control" value={pf.phone} onChange={e => setPf({...pf, phone: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Email (read-only)</label><input className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.6 }} /></div>

                <div className="section-label"><FiMapPin /> Address</div>
                <div className="form-group"><label>Street</label><input className="form-control" placeholder="House no., building, street…" value={pf.street} onChange={e => setPf({...pf, street: e.target.value})} /></div>
                <div className="form-row-3">
                  <div className="form-group"><label>City</label><input className="form-control" value={pf.city} onChange={e => setPf({...pf, city: e.target.value})} /></div>
                  <div className="form-group"><label>State</label><input className="form-control" value={pf.state} onChange={e => setPf({...pf, state: e.target.value})} /></div>
                  <div className="form-group"><label>Pincode</label><input className="form-control" value={pf.pincode} onChange={e => setPf({...pf, pincode: e.target.value})} maxLength={6} /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </form>
            </div>
          )}

          {tab === 'password' && (
            <div className="profile-form-card">
              <h2>Change Password</h2>
              <form onSubmit={handlePwChange}>
                {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([k,l]) => (
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input type="password" className="form-control" value={pw[k]} onChange={e => setPw({...pw, [k]: e.target.value})} />
                  </div>
                ))}
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Updating…' : 'Update Password'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
