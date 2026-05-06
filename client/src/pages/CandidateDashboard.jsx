import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CandidateDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('/api/applications/my');
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications', error);
    }
  };

  const getStatusCounts = () => {
    let applied = 0, shortlisted = 0, rejected = 0;
    applications.forEach(app => {
      if (app.status === 'applied') applied++;
      if (app.status === 'shortlisted') shortlisted++;
      if (app.status === 'rejected') rejected++;
    });
    return { applied, shortlisted, rejected };
  };

  const counts = getStatusCounts();

  const pieData = [
    { name: 'Applied', value: counts.applied },
    { name: 'Shortlisted', value: counts.shortlisted },
    { name: 'Rejected', value: counts.rejected },
  ].filter(d => d.value > 0);

  const COLORS = ['var(--primary-blue)', '#059669', '#b91c1c'];

  return (
    <div className="candidate-section">
      <div className="dashboard-stats" style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <div className="card stat-card" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-blue)', margin: 0 }}>{applications.length}</h2>
          <p style={{ color: 'var(--text-gray)', margin: 0, fontWeight: 500 }}>Total Applied</p>
        </div>
        <div className="card stat-card" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#059669', margin: 0 }}>{counts.shortlisted}</h2>
          <p style={{ color: 'var(--text-gray)', margin: 0, fontWeight: 500 }}>Shortlisted</p>
        </div>
        <div className="card stat-card" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#b91c1c', margin: 0 }}>{counts.rejected}</h2>
          <p style={{ color: 'var(--text-gray)', margin: 0, fontWeight: 500 }}>Rejected</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Application Analytics</h3>
        <div style={{ display: 'flex', gap: '20px', height: '300px' }}>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-dark)' }}>Status Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-dark)' }}>Recent Activity</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="applications-section card">
        <h3>My Applications</h3>
        {applications.length === 0 ? (
          <p style={{ color: 'var(--text-gray)' }}>You haven't applied to any jobs yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{app.job?.title}</td>
                    <td>{app.job?.company}</td>
                    <td>{app.job?.location}</td>
                    <td><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
