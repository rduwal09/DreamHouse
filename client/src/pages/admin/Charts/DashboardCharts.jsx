import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardCharts = () => {
  const [usersData, setUsersData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Users Growth (weekly)
        const usersRes = await fetch("http://localhost:3001/api/admin/analytics/users-growth");
        const usersJson = await usersRes.json();
        console.log("📊 Users Data:", usersJson);
        setUsersData(usersJson.map(u => ({ week: u.week, users: u.users })));

        // Bookings (weekly)
        const bookingsRes = await fetch("http://localhost:3001/api/admin/analytics/bookings");
        const bookingsJson = await bookingsRes.json();
        console.log("📊 Bookings Data:", bookingsJson);
        setBookingsData(bookingsJson.map(b => ({ week: b.week, bookings: b.bookings })));

        // Revenue (weekly)
        const revenueRes = await fetch("http://localhost:3001/api/admin/analytics/revenue");
        const revenueJson = await revenueRes.json();
        console.log("📊 Revenue Data:", revenueJson);
        setRevenueData(revenueJson.map(r => ({ week: r.week, revenue: r.revenue })));
      } catch (err) {
        console.error("❌ Analytics fetch failed:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="charts-grid">
      {/* Users Growth */}
      <div className="chart-card">
        <h3>Users Growth (Weekly)</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={usersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings */}
      <div className="chart-card">
        <h3>Bookings (Weekly)</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#f59e0b" barSize={40} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue */}
      <div className="chart-card">
        <h3>Revenue (Weekly)</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
