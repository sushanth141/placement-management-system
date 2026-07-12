import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

function Sidebar({ activeTab, setActiveTab, user, logout }) {
  const nav = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'create', icon: '➕', label: 'Create User' },
    { id: 'users', icon: '👥', label: 'All Users' },
    { id: 'applications', icon: '📋', label: 'All Applications' },
    { id: 'jobs', icon: '💼', label: 'All Jobs' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        <div>
          <div className="sidebar-logo-text">PlaceIt</div>
          <div className="sidebar-logo-sub">Admin Console</div>
        </div>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Management</div>
        {nav.map(n => (
          <button key={n.id} className={`sidebar-nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)}>
            <span className="sidebar-nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>{user.name[0].toUpperCase()}</div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>🚪 Logout</button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'student', rollNumber: '', companyName: '' });
  const [createdCreds, setCreatedCreds] = useState(null);
  const [creating, setCreating] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/applications/all'),
      api.get('/jobs'),
      api.get('/admin/users/all'),
    ]).then(([a, j, u]) => {
      setApplications(a.data);
      setJobs(j.data);
      setAllUsers(u.data);
      setLoading(false);
    });
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreatedCreds(null);
    try {
      const { data } = await api.post('/admin/users/create', createForm);
      setCreatedCreds(data);
      setAllUsers(prev => [{ _id: data._id, name: data.name, email: data.email, role: data.role, rollNumber: data.rollNumber, status: 'approved', mustChangePassword: true, createdAt: new Date() }, ...prev]);
      setCreateForm({ name: '', email: '', role: 'student', rollNumber: '', companyName: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return alert('Please select a CSV file first');
    setUploading(true);
    setBulkResult(null);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const { data } = await api.post('/admin/users/bulk-create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBulkResult(data);
      // Refresh user list
      const u = await api.get('/admin/users/all');
      setAllUsers(u.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUserStatus = async (userId, status) => {
    const { data } = await api.patch(`/admin/users/${userId}/status`, { status });
    setAllUsers(prev => prev.map(u => u._id === userId ? data : u));
  };

  const resetPassword = async (userId) => {
    if (!confirm('Are you sure you want to reset this user\'s password? They will be forced to change it on their next login.')) return;
    try {
      const { data } = await api.patch(`/admin/users/${userId}/reset-password`);
      alert(`Password reset successfully!\n\nNew temporary password is: ${data.defaultPassword}\n\nPlease share this with the user.`);
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, mustChangePassword: true } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${userId}`);
    setAllUsers(prev => prev.filter(u => u._id !== userId));
  };

  const updateAppStatus = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Delete this job?')) return;
    await api.delete(`/jobs/${jobId}`);
    setJobs(prev => prev.filter(j => j._id !== jobId));
  };

  const hired = applications.filter(a => a.status === 'hired').length;
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;
  const students = allUsers.filter(u => u.role === 'student').length;
  const companies = allUsers.filter(u => u.role === 'company').length;

  const getTypeBadge = (type) => type === 'full-time' ? 'badge-fulltime' : type === 'internship' ? 'badge-internship' : 'badge-contract';
  const roleBg = (role) => role === 'student' ? 'var(--info-bg)' : 'var(--success-bg)';
  const roleColor = (role) => role === 'student' ? 'var(--info)' : 'var(--success)';
  const statusColor = (s) => s === 'approved' ? 'var(--success)' : s === 'rejected' ? 'var(--danger)' : 'var(--warning)';

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout} />
      <main className="dashboard-main">

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <>
            <div className="page-header">
              <h1>Admin Overview</h1>
              <p>Platform-wide statistics and quick insights</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">🎓</div><div><div className="stat-value">{students}</div><div className="stat-label">Students</div></div></div>
              <div className="stat-card"><div className="stat-icon">🏢</div><div><div className="stat-value">{companies}</div><div className="stat-label">Companies</div></div></div>
              <div className="stat-card"><div className="stat-icon">💼</div><div><div className="stat-value">{jobs.length}</div><div className="stat-label">Active Jobs</div></div></div>
              <div className="stat-card"><div className="stat-icon">🏆</div><div><div className="stat-value">{hired}</div><div className="stat-label">Hired</div></div></div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
              <div className="section-header"><div className="section-title">Application Pipeline</div></div>
              {[
                { label: 'Hired', value: hired, color: 'var(--success)' },
                { label: 'Shortlisted', value: shortlisted, color: 'var(--warning)' },
                { label: 'Rejected', value: rejected, color: 'var(--danger)' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>{item.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.value} / {applications.length}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: applications.length ? `${(item.value / applications.length) * 100}%` : '0%', background: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Create User ── */}
        {activeTab === 'create' && (
          <>
            <div className="page-header">
              <h1>Create User Account</h1>
              <p>Create accounts for students or companies and share the credentials with them</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Account Details</h3>
                <form onSubmit={handleCreateUser}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input id="cu-name" placeholder="e.g. John Doe" required value={createForm.name}
                      onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input id="cu-email" type="email" placeholder="student@college.edu" required value={createForm.email}
                      onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select id="cu-role" value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                      <option value="student">🎓 Student</option>
                      <option value="company">🏢 Company</option>
                    </select>
                  </div>
                  {createForm.role === 'student' && (
                    <div className="form-group">
                      <label>Roll Number</label>
                      <input id="cu-roll" placeholder="e.g. 21BCE1234" value={createForm.rollNumber}
                        onChange={e => setCreateForm({ ...createForm, rollNumber: e.target.value })} />
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        Default password will be the roll number
                      </div>
                    </div>
                  )}
                  {createForm.role === 'company' && (
                    <div className="form-group">
                      <label>Company Name</label>
                      <input id="cu-company" placeholder="e.g. Google India" value={createForm.companyName}
                        onChange={e => setCreateForm({ ...createForm, companyName: e.target.value })} />
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        Default password will be email prefix
                      </div>
                    </div>
                  )}
                  <button id="cu-submit" type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? <><span className="spinner"></span> Creating...</> : '➕ Create Account'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Bulk Upload (CSV)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Upload a CSV file to create multiple accounts at once.
                    Columns required: <strong>Name, Email, Role</strong> (student/company). Optional: <strong>RollNumber, CompanyName</strong>.
                  </p>
                  <form onSubmit={handleBulkUpload}>
                    <div className="form-group">
                      <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} style={{ padding: '0.5rem 0' }} />
                    </div>
                    <button type="submit" className="btn" style={{ background: 'var(--accent)', border: 'none' }} disabled={uploading || !csvFile}>
                      {uploading ? <><span className="spinner"></span> Uploading...</> : '📤 Upload & Create'}
                    </button>
                  </form>

                  {bulkResult && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: bulkResult.errors.length > 0 ? 'var(--warning-bg)' : 'var(--success-bg)', borderRadius: 'var(--radius-sm)', border: `1px solid ${bulkResult.errors.length > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                      <strong style={{ color: bulkResult.errors.length > 0 ? 'var(--warning)' : 'var(--success)' }}>{bulkResult.message}</strong>
                      
                      {bulkResult.errors.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem' }}>Errors ({bulkResult.errors.length}):</div>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {bulkResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                            {bulkResult.errors.length > 5 && <li>...and {bulkResult.errors.length - 5} more</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {createdCreds ? (
                  <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 'var(--radius)', padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Account Created!</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Share these credentials with the user:
                    </p>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: '1.2rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      <div style={{ marginBottom: '0.5rem' }}>👤 Name: <strong>{createdCreds.name}</strong></div>
                      <div style={{ marginBottom: '0.5rem' }}>📧 Email: <strong>{createdCreds.email}</strong></div>
                      <div style={{ marginBottom: '0.5rem' }}>🔑 Password: <strong style={{ color: 'var(--warning)' }}>{createdCreds.defaultPassword}</strong></div>
                      {createdCreds.rollNumber && <div>🎓 Roll No: <strong>{createdCreds.rollNumber}</strong></div>}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                      ⚠️ The user will be prompted to change their password on first login.
                    </p>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }} onClick={() => setCreatedCreds(null)}>
                      Create Another
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>ℹ️</div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', textAlign: 'center' }}>Single Creation</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {[
                        '1. Fill the form and click Create Account',
                        '2. System auto-generates default password (roll number)',
                        '3. Share email + password with the student/company',
                        '4. User logs in and is forced to set a new password',
                      ].map(step => (
                        <div key={step} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--accent-light)', flexShrink: 0 }}>→</span> {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── All Users ── */}
        {activeTab === 'users' && (
          <>
            <div className="page-header">
              <h1>All Users</h1>
              <p>Manage all registered students and companies</p>
            </div>
            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Roll No</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Pwd Changed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                              {u.name[0].toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{u.name}</span>
                              {u.resetRequested && <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700 }}>🔔 Reset Requested!</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.rollNumber || '—'}</td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, background: roleBg(u.role), color: roleColor(u.role) }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: statusColor(u.status) }}>
                            {u.status === 'approved' ? '✅' : u.status === 'rejected' ? '❌' : '⏳'} {u.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: u.mustChangePassword ? 'var(--warning)' : 'var(--success)' }}>
                          {u.mustChangePassword ? '⏳ Pending' : '✅ Done'}
                        </td>
                        <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {u.status !== 'approved' && (
                            <button className="btn btn-sm" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }}
                              onClick={() => handleUserStatus(u._id, 'approved')}>Approve</button>
                          )}
                          {u.status !== 'rejected' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleUserStatus(u._id, 'rejected')}>Reject</button>
                          )}
                          <button className="btn btn-sm" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)' }} onClick={() => resetPassword(u._id)}>Reset Pwd</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── All Applications ── */}
        {activeTab === 'applications' && (
          <>
            <div className="page-header">
              <h1>All Applications</h1>
              <p>Review and manage every student application</p>
            </div>
            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div>
            ) : applications.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📭</div><p>No applications yet</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Student</th><th>Email</th><th>Job</th><th>Company</th><th>Applied</th><th>Documents</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                              {app.student?.name?.[0]?.toUpperCase()}
                            </div>
                            {app.student?.name}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{app.student?.email}</td>
                        <td><strong>{app.job?.title}</strong></td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{app.job?.company?.profile?.companyName || app.job?.company?.name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: 120 }}>
                            {app.student?.profile?.resume && <a href={`${BASE_URL}${app.student.profile.resume}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>📄 Resume</a>}
                            {app.student?.profile?.photo && <a href={`${BASE_URL}${app.student.profile.photo}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>📸 Photo</a>}
                            {app.student?.profile?.aadharProof && <a href={`${BASE_URL}${app.student.profile.aadharProof}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>🆔 Aadhar</a>}
                            {!app.student?.profile?.resume && !app.student?.profile?.photo && !app.student?.profile?.aadharProof && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>}
                          </div>
                        </td>
                        <td>
                          <select id={`status-${app._id}`} className="status-select" value={app.status} onChange={e => updateAppStatus(app._id, e.target.value)}>
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── All Jobs ── */}
        {activeTab === 'jobs' && (
          <>
            <div className="page-header">
              <h1>All Jobs</h1>
              <p>Manage all job postings on the platform</p>
            </div>
            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div>
            ) : jobs.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">💼</div><p>No jobs posted yet</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Company</th><th>Type</th><th>Location</th><th>Deadline</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job._id}>
                        <td><strong>{job.title}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{job.company?.profile?.companyName || job.company?.name}</td>
                        <td><span className={`job-badge ${getTypeBadge(job.type)}`}>{job.type}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{job.location || '—'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(job.deadline).toLocaleDateString()}</td>
                        <td><button id={`del-job-${job._id}`} className="btn btn-danger btn-sm" onClick={() => deleteJob(job._id)}>🗑 Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
