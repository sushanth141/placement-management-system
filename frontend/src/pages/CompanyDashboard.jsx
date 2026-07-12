import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const INITIAL_FORM = {
  title: '', description: '', location: '', salary: '',
  type: 'full-time', deadline: '',
  eligibilityCriteria: { minCGPA: 0, skills: '' },
};

function Sidebar({ activeTab, setActiveTab, user, logout }) {
  const nav = [
    { id: 'jobs', icon: '💼', label: 'My Jobs' },
    { id: 'post', icon: '➕', label: 'Post a Job' },
    { id: 'applicants', icon: '👥', label: 'Applicants' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏢</div>
        <div>
          <div className="sidebar-logo-text">PlaceIt</div>
          <div className="sidebar-logo-sub">Company Portal</div>
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
          <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>{user.name[0].toUpperCase()}</div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">Company</div>
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

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    api.get('/jobs/my').then(({ data }) => { setJobs(data); setLoading(false); });
  }, []);

  const createJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const payload = {
        ...form,
        salary: Number(form.salary),
        eligibilityCriteria: {
          minCGPA: Number(form.eligibilityCriteria.minCGPA),
          skills: form.eligibilityCriteria.skills.split(',').map(s => s.trim()).filter(Boolean),
        },
      };
      const { data } = await api.post('/jobs', payload);
      setJobs(prev => [data, ...prev]);
      setForm(INITIAL_FORM);
      showToast('Job posted successfully!');
      setActiveTab('jobs');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error posting job', 'error');
    } finally {
      setPosting(false);
    }
  };

  const viewApplicants = async (job) => {
    setSelectedJobTitle(job.title);
    const { data } = await api.get(`/applications/job/${job._id}`);
    setApplicants(data);
    setActiveTab('applicants');
  };

  const updateStatus = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Delete this job posting?')) return;
    await api.delete(`/jobs/${jobId}`);
    setJobs(prev => prev.filter(j => j._id !== jobId));
    showToast('Job deleted');
  };

  const getTypeBadge = (type) => type === 'full-time' ? 'badge-fulltime' : type === 'internship' ? 'badge-internship' : 'badge-contract';

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout} />
      <main className="dashboard-main">
        {activeTab === 'jobs' && (
          <>
            <div className="page-header">
              <h1>My Job Postings</h1>
              <p>Manage your active positions and view candidates</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">💼</div><div><div className="stat-value">{jobs.length}</div><div className="stat-label">Jobs Posted</div></div></div>
              <div className="stat-card"><div className="stat-icon">✅</div><div><div className="stat-value">{jobs.filter(j => j.isActive).length}</div><div className="stat-label">Active</div></div></div>
            </div>
            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No jobs posted yet</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem', width: 'auto' }} onClick={() => setActiveTab('post')}>Post your first job</button>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map(job => (
                  <div className="job-card" key={job._id}>
                    <div className="job-card-header">
                      <div>
                        <div className="job-title">{job.title}</div>
                        <div className="job-company" style={{ color: 'var(--text-secondary)' }}>{job.location}</div>
                      </div>
                      <span className={`job-badge ${getTypeBadge(job.type)}`}>{job.type}</span>
                    </div>
                    <div className="job-meta">
                      {job.salary && <span className="job-meta-item">💰 ₹{job.salary.toLocaleString()}</span>}
                      <span className="job-meta-item">📅 {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {job.description.slice(0, 100)}{job.description.length > 100 ? '...' : ''}
                    </p>
                    <div className="job-actions">
                      <button id={`view-app-${job._id}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => viewApplicants(job)}>
                        👥 View Applicants
                      </button>
                      <button id={`del-${job._id}`} className="btn btn-danger btn-sm" onClick={() => deleteJob(job._id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'post' && (
          <>
            <div className="page-header">
              <h1>Post a New Job</h1>
              <p>Fill in the details to attract the right candidates</p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', maxWidth: 680 }}>
              <form onSubmit={createJob}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Job Title *</label>
                    <input id="job-title" placeholder="e.g. Frontend Developer" required value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Description *</label>
                    <textarea id="job-desc" placeholder="Describe the role, responsibilities, and requirements..." required value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 130 }} />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input id="job-location" placeholder="e.g. Bangalore, Remote" value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Salary (₹/year)</label>
                    <input id="job-salary" type="number" placeholder="e.g. 600000" value={form.salary}
                      onChange={e => setForm({ ...form, salary: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Job Type</label>
                    <select id="job-type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="full-time">Full-Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Application Deadline *</label>
                    <input id="job-deadline" type="date" required value={form.deadline}
                      onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Min CGPA</label>
                    <input id="job-cgpa" type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.0"
                      value={form.eligibilityCriteria.minCGPA}
                      onChange={e => setForm({ ...form, eligibilityCriteria: { ...form.eligibilityCriteria, minCGPA: e.target.value } })} />
                  </div>
                  <div className="form-group">
                    <label>Required Skills (comma-separated)</label>
                    <input id="job-skills" placeholder="e.g. React, Node.js, MongoDB"
                      value={form.eligibilityCriteria.skills}
                      onChange={e => setForm({ ...form, eligibilityCriteria: { ...form.eligibilityCriteria, skills: e.target.value } })} />
                  </div>
                </div>
                <button id="post-job-submit" type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={posting}>
                  {posting ? <><span className="spinner"></span> Posting...</> : '📢 Post Job'}
                </button>
              </form>
            </div>
          </>
        )}

        {activeTab === 'applicants' && (
          <>
            <div className="page-header">
              <h1>Applicants</h1>
              <p>Candidates for: <strong>{selectedJobTitle}</strong></p>
            </div>
            {applicants.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">👥</div><p>No applicants yet for this job</p></div>
            ) : (
              <div className="jobs-grid">
                {applicants.map(app => (
                  <div className="job-card" key={app._id}>
                    <div className="job-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                          {app.student?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="job-title">{app.student?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.student?.email}</div>
                        </div>
                      </div>
                      <span className={`job-badge badge-${app.status}`}>{app.status}</span>
                    </div>
                    <div className="job-meta">
                      {app.student?.profile?.cgpa && <span className="job-meta-item">🎓 CGPA: {app.student.profile.cgpa}</span>}
                    </div>
                    {app.student?.profile?.skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {app.student.profile.skills.map(s => <span key={s} className="chip">{s}</span>)}
                      </div>
                    )}
                    
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'grid', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📄 Student Documents</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {app.student?.profile?.resume ? (
                          <a href={`http://localhost:5000${app.student.profile.resume}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>📑 Resume</a>
                        ) : <span className="chip" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>No Resume</span>}
                        
                        {app.student?.profile?.photo ? (
                          <a href={`http://localhost:5000${app.student.profile.photo}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>🖼️ Photo</a>
                        ) : <span className="chip" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>No Photo</span>}
                        
                        {app.student?.profile?.aadharProof ? (
                          <a href={`http://localhost:5000${app.student.profile.aadharProof}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>🪪 Aadhar</a>
                        ) : <span className="chip" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>No Aadhar</span>}
                      </div>
                    </div>

                    {app.coverLetter && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' }}>
                        "{app.coverLetter.slice(0, 120)}{app.coverLetter.length > 120 ? '...' : ''}"
                      </p>
                    )}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Update Status</label>
                      <select id={`app-status-${app._id}`} className="status-select" style={{ width: '100%' }} value={app.status} onChange={e => updateStatus(app._id, e.target.value)}>
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
