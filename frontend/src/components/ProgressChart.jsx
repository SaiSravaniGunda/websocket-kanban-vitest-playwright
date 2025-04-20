// frontend/src/components/ProgressChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './ProgressChart.css';

const COLORS = ['#0088FE', '#FFBB28', '#00C49F'];

const ProgressChart = ({ tasks }) => {
  const getChartData = () => {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'To Do', value: statusCounts['To Do'] || 0 },
      { name: 'In Progress', value: statusCounts['In Progress'] || 0 },
      { name: 'Done', value: statusCounts['Done'] || 0 }
    ];
  };

  const data = getChartData();
  const totalTasks = tasks.length;
  const completedPercentage = totalTasks > 0 
    ? Math.round((data[2].value / totalTasks) * 100) 
    : 0;

  return (
    <div className="progress-container">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="progress-stats">
        <h3>Progress Summary</h3>
        <p>Total Tasks: <strong>{totalTasks}</strong></p>
        <p>Completed: <strong>{completedPercentage}%</strong></p>
      </div>
    </div>
  );
};

export default ProgressChart;