import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Sidebar({ activeTab, setActiveTab, user, logout }) {
  const nav = [
    { id: 'jobs', icon: '💼', label: 'Browse Jobs' },
    { id: 'applications', icon: '📋', label: 'My Applications' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <div>
          <div className="sidebar-logo-text">PlaceIt</div>
          <div className="sidebar-logo-sub">Student Portal</div>
        </div>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        {nav.map(n => (
          <button key={n.id} className={`sidebar-nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)}>
            <span className="sidebar-nav-icon">{n.icon}</span> {n.label}
          </button>
        ))}
      </div>
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">{user.name[0].toUpperCase()}</div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">Student</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>🚪 Logout</button>
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

function ApplyModal({ job, profileData, onProfileSubmit, isProfileComplete, onClose, onApply }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Profile Form State inside Modal
  const [pForm, setPForm] = useState({
    phone: profileData?.profile?.phone || '',
    branch: profileData?.profile?.branch || '',
    passingYear: profileData?.profile?.passingYear || '',
    cgpa: profileData?.profile?.cgpa || '',
    skills: profileData?.profile?.skills?.join(', ') || ''
  });
  const [pFiles, setPFiles] = useState({ resume: null, photo: null, aadharProof: null });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!isProfileComplete) {
      await onProfileSubmit(pForm, pFiles);
      // Wait for profile to update, but they still need to click apply again or we apply for them
      await onApply(job._id, coverLetter);
    } else {
      await onApply(job._id, coverLetter);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: isProfileComplete ? 500 : 700, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div className="modal-title">{isProfileComplete ? `Apply for ${job.title}` : 'Complete Profile to Apply'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {!isProfileComplete && (
          <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            ⚠️ You must fill out your profile details and upload your documents before your first application. This will be saved for future applications.
          </div>
        )}

        <form onSubmit={submit}>
          {!isProfileComplete && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input required value={pForm.phone} onChange={e => setPForm({...pForm, phone: e.target.value})} placeholder="e.g. 9876543210" />
                </div>
                <div className="form-group">
                  <label>Branch / Department *</label>
                  <input required value={pForm.branch} onChange={e => setPForm({...pForm, branch: e.target.value})} placeholder="e.g. Computer Science" />
                </div>
                <div className="form-group">
                  <label>Passing Year *</label>
                  <input type="number" required value={pForm.passingYear} onChange={e => setPForm({...pForm, passingYear: e.target.value})} placeholder="e.g. 2025" />
                </div>
                <div className="form-group">
                  <label>Current CGPA *</label>
                  <input type="number" step="0.01" required value={pForm.cgpa} onChange={e => setPForm({...pForm, cgpa: e.target.value})} placeholder="e.g. 8.5" />
                </div>
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input value={pForm.skills} onChange={e => setPForm({...pForm, skills: e.target.value})} placeholder="React, Node.js, Python" />
              </div>

              <div className="divider"></div>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Required Documents</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Resume (PDF) *</label>
                  <input type="file" required accept=".pdf" onChange={e => setPFiles({...pFiles, resume: e.target.files[0]})} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Professional Photo (Image) *</label>
                  <input type="file" required accept="image/*" onChange={e => setPFiles({...pFiles, photo: e.target.files[0]})} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Aadhar Card Proof (PDF/Image) *</label>
                  <input type="file" required accept=".pdf,image/*" onChange={e => setPFiles({...pFiles, aadharProof: e.target.files[0]})} />
                </div>
              </div>
              <div className="divider"></div>
            </>
          )}

          <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Applying to: <strong>{job.company?.profile?.companyName || job.company?.name}</strong> · {job.location}
          </div>
          <div className="form-group">
            <label>Cover Letter (optional)</label>
            <textarea
              placeholder="Tell them why you're a great fit..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <><span className="spinner"></span> Processing...</> : '🚀 Save & Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(null);

  // Profile Form State
  const [pForm, setPForm] = useState({ phone: '', branch: '', passingYear: '', cgpa: '', skills: '' });
  const [pFiles, setPFiles] = useState({ resume: null, photo: null, aadharProof: null });
  const [savingProfile, setSavingProfile] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    Promise.all([api.get('/jobs'), api.get('/applications/my'), api.get('/auth/me')]).then(([j, a, m]) => {
      setJobs(j.data);
      setApplications(a.data);
      setProfileData(m.data);
      if (m.data?.profile) {
        setPForm({
          phone: m.data.profile.phone || '',
          branch: m.data.profile.branch || '',
          passingYear: m.data.profile.passingYear || '',
          cgpa: m.data.profile.cgpa || '',
          skills: m.data.profile.skills?.join(', ') || ''
        });
      }
      setLoading(false);
    });
  }, []);

  const handleApply = async (jobId, coverLetter) => {
    try {
      await api.post(`/applications/${jobId}`, { coverLetter });
      const { data } = await api.get('/applications/my');
      setApplications(data);
      showToast('Application submitted!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error applying', 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('phone', pForm.phone);
      formData.append('branch', pForm.branch);
      formData.append('passingYear', pForm.passingYear);
      formData.append('cgpa', pForm.cgpa);
      formData.append('skills', pForm.skills);
      
      if (pFiles.resume) formData.append('resume', pFiles.resume);
      if (pFiles.photo) formData.append('photo', pFiles.photo);
      if (pFiles.aadharProof) formData.append('aadharProof', pFiles.aadharProof);

      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileData(data);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const appliedIds = new Set(applications.map(a => a.job?._id));
  
  const isProfileComplete = profileData && 
    profileData.profile?.resume && 
    profileData.profile?.photo && 
    profileData.profile?.aadharProof && 
    profileData.profile?.phone && 
    profileData.profile?.branch && 
    profileData.profile?.passingYear && 
    profileData.profile?.cgpa;

  const getBadgeClass = (type) => type === 'full-time' ? 'badge-fulltime' : type === 'internship' ? 'badge-internship' : 'badge-contract';
  const getStatusBadge = (status) => `badge-${status}`;

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout} />
      <main className="dashboard-main">
        
        {/* -- BROWSE JOBS -- */}
        {activeTab === 'jobs' && (
          <>
            <div className="page-header">
              <h1>Browse Jobs</h1>
              <p>Discover opportunities that match your profile</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">💼</div><div><div className="stat-value">{jobs.length}</div><div className="stat-label">Open Positions</div></div></div>
              <div className="stat-card"><div className="stat-icon">📋</div><div><div className="stat-value">{applications.length}</div><div className="stat-label">Applications Sent</div></div></div>
              <div className="stat-card"><div className="stat-icon">✅</div><div><div className="stat-value">{applications.filter(a => a.status === 'shortlisted').length}</div><div className="stat-label">Shortlisted</div></div></div>
              <div className="stat-card"><div className="stat-icon">🏆</div><div><div className="stat-value">{applications.filter(a => a.status === 'hired').length}</div><div className="stat-label">Hired</div></div></div>
            </div>

            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div>
            ) : jobs.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🔍</div><p>No jobs available right now</p></div>
            ) : (
              <div className="jobs-grid">
                {jobs.map(job => (
                  <div className="job-card" key={job._id}>
                    <div className="job-card-header">
                      <div>
                        <div className="job-title">{job.title}</div>
                        <div className="job-company">{job.company?.profile?.companyName || job.company?.name}</div>
                      </div>
                      <span className={`job-badge ${getBadgeClass(job.type)}`}>{job.type}</span>
                    </div>
                    <div className="job-meta">
                      {job.location && <span className="job-meta-item">📍 {job.location}</span>}
                      {job.salary && <span className="job-meta-item">💰 ₹{job.salary.toLocaleString()}</span>}
                      <span className="job-meta-item">📅 {new Date(job.deadline).toLocaleDateString()}</span>
                      {job.eligibilityCriteria?.minCGPA > 0 && (
                        <span className="job-meta-item">🎯 Min CGPA: {job.eligibilityCriteria.minCGPA}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {job.description.slice(0, 100)}{job.description.length > 100 ? '...' : ''}
                    </p>
                    <div className="job-actions">
                      <button
                        id={`apply-${job._id}`}
                        className={`btn ${appliedIds.has(job._id) ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                        style={{ flex: 1 }}
                        disabled={appliedIds.has(job._id)}
                        onClick={() => setApplyModal(job)}
                      >
                        {appliedIds.has(job._id) ? '✓ Applied' : '🚀 Apply Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* -- MY APPLICATIONS -- */}
        {activeTab === 'applications' && (
          <>
            <div className="page-header">
              <h1>My Applications</h1>
              <p>Track the status of all your job applications</p>
            </div>
            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>You haven't applied to any jobs yet</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Type</th>
                      <th>Applied On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app._id}>
                        <td><strong>{app.job?.title}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{app.job?.company?.profile?.companyName || app.job?.company?.name}</td>
                        <td><span className={`job-badge ${getBadgeClass(app.job?.type)}`}>{app.job?.type}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td><span className={`job-badge ${getStatusBadge(app.status)}`}>{app.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* -- MY PROFILE -- */}
        {activeTab === 'profile' && (
          <>
            <div className="page-header">
              <h1>My Profile & Documents</h1>
              <p>Complete this section to unlock job applications</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem' }}>
                <form onSubmit={handleProfileUpdate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input required value={pForm.phone} onChange={e => setPForm({...pForm, phone: e.target.value})} placeholder="e.g. 9876543210" />
                    </div>
                    <div className="form-group">
                      <label>Branch / Department *</label>
                      <input required value={pForm.branch} onChange={e => setPForm({...pForm, branch: e.target.value})} placeholder="e.g. Computer Science" />
                    </div>
                    <div className="form-group">
                      <label>Passing Year *</label>
                      <input type="number" required value={pForm.passingYear} onChange={e => setPForm({...pForm, passingYear: e.target.value})} placeholder="e.g. 2025" />
                    </div>
                    <div className="form-group">
                      <label>Current CGPA *</label>
                      <input type="number" step="0.01" required value={pForm.cgpa} onChange={e => setPForm({...pForm, cgpa: e.target.value})} placeholder="e.g. 8.5" />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label>Skills (comma separated)</label>
                    <input value={pForm.skills} onChange={e => setPForm({...pForm, skills: e.target.value})} placeholder="React, Node.js, Python" />
                  </div>

                  <div className="divider"></div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Required Documents</h3>
                  
                  <div className="form-group">
                    <label>Resume (PDF) {profileData?.profile?.resume && '✅ Uploaded'}</label>
                    <input type="file" accept=".pdf" onChange={e => setPFiles({...pFiles, resume: e.target.files[0]})} style={{ padding: '0.5rem 0' }} />
                  </div>
                  <div className="form-group">
                    <label>Professional Photo (Image) {profileData?.profile?.photo && '✅ Uploaded'}</label>
                    <input type="file" accept="image/*" onChange={e => setPFiles({...pFiles, photo: e.target.files[0]})} style={{ padding: '0.5rem 0' }} />
                  </div>
                  <div className="form-group">
                    <label>Aadhar Card Proof (PDF/Image) {profileData?.profile?.aadharProof && '✅ Uploaded'}</label>
                    <input type="file" accept=".pdf,image/*" onChange={e => setPFiles({...pFiles, aadharProof: e.target.files[0]})} style={{ padding: '0.5rem 0' }} />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={savingProfile}>
                    {savingProfile ? <><span className="spinner"></span> Saving...</> : '💾 Save Profile & Upload Documents'}
                  </button>
                </form>
              </div>

              {/* Status Sidebar */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Profile Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Personal Info</span>
                    <span>{profileData?.profile?.phone && profileData?.profile?.cgpa ? '✅' : '❌'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Resume</span>
                    <span>{profileData?.profile?.resume ? '✅' : '❌'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Photo</span>
                    <span>{profileData?.profile?.photo ? '✅' : '❌'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Aadhar Proof</span>
                    <span>{profileData?.profile?.aadharProof ? '✅' : '❌'}</span>
                  </div>
                </div>
                <div className="divider"></div>
                <div style={{ textAlign: 'center' }}>
                  {isProfileComplete ? (
                    <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.95rem' }}>🎉 Profile Complete!</div>
                  ) : (
                    <div style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.95rem' }}>⚠️ Profile Incomplete</div>
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    You must complete all required fields and upload all documents before applying to jobs.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {applyModal && (
        <ApplyModal 
          job={applyModal} 
          profileData={profileData}
          isProfileComplete={isProfileComplete}
          onProfileSubmit={async (pForm, pFiles) => {
            const formData = new FormData();
            formData.append('phone', pForm.phone);
            formData.append('branch', pForm.branch);
            formData.append('passingYear', pForm.passingYear);
            formData.append('cgpa', pForm.cgpa);
            formData.append('skills', pForm.skills);
            if (pFiles.resume) formData.append('resume', pFiles.resume);
            if (pFiles.photo) formData.append('photo', pFiles.photo);
            if (pFiles.aadharProof) formData.append('aadharProof', pFiles.aadharProof);
            const { data } = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfileData(data);
          }}
          onClose={() => setApplyModal(null)} 
          onApply={handleApply} 
        />
      )}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
