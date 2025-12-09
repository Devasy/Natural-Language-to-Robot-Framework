import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const MetricsPage = ({ theme }) => {
  const [metrics, setMetrics] = useState([]);
  const [aggregate, setAggregate] = useState({});
  const [filter, setFilter] = useState('all'); // '1', '7', '30', 'all'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [filter]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
        let url = '/api/workflow-metrics/';
        let aggUrl = '/api/workflow-metrics/aggregate';

        if (filter !== 'all') {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(filter));

            url += `?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
            aggUrl += `?last_days=${filter}`;
        }

        const [resMetrics, resAgg] = await Promise.all([
            fetch(url).then(r => r.json()),
            fetch(aggUrl).then(r => r.json())
        ]);

        setMetrics(resMetrics);
        setAggregate(resAgg);
    } catch (error) {
        console.error("Failed to fetch metrics", error);
    } finally {
        setLoading(false);
    }
  };

  const isNeo = theme === 'neobrutalism';
  const colorPrimary = isNeo ? '#ccff00' : '#3b82f6';
  const colorSecondary = isNeo ? '#ff00ff' : '#64748b';
  const gridColor = isNeo ? '#000000' : '#e2e8f0';
  const borderWidth = isNeo ? 2 : 1;

  // Prepare Chart Data
  const sortedMetrics = [...metrics].reverse();
  const volumeData = {
      labels: sortedMetrics.map(m => format(new Date(m.timestamp), 'MM:dd:HH:mm:ss')),
      datasets: [
          {
              label: 'Execution Time (s)',
              data: sortedMetrics.map(m => m.execution_time),
              borderColor: colorPrimary,
              backgroundColor: isNeo ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
              borderWidth: borderWidth + 1,
              tension: 0.4,
              fill: true,
          },
          {
            label: 'LLM Calls',
            data: sortedMetrics.map(m => m.total_llm_calls),
            borderColor: colorSecondary,
            borderDash: [5, 5],
            borderWidth: borderWidth,
            tension: 0.4
          }
      ]
  };

  const costData = {
      labels: ['Browser Actions', 'CrewAI Logic'],
      datasets: [{
          data: [
            metrics.reduce((acc, m) => acc + (m.browser_use_cost || 0), 0),
            metrics.reduce((acc, m) => acc + (m.crewai_cost || 0), 0)
          ],
          backgroundColor: [colorPrimary, colorSecondary],
          borderColor: isNeo ? '#000' : '#fff',
          borderWidth: borderWidth
      }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: '#888' } },
        x: { display: false }
    },
    plugins: { legend: { display: true } }
  };

  const successRate = (aggregate.avg_success_rate * 100) || 0;

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
             <h1 className={`text-3xl font-bold text-[var(--text-main)] ${isNeo ? 'uppercase glitch' : ''}`} data-text="METRICS">Workflow Metrics</h1>
             <div className="flex gap-2">
                {['1', '7', '30', 'all'].map(d => (
                    <button
                        key={d}
                        onClick={() => setFilter(d)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-[var(--border-radius-sm)] border border-[var(--border-color)] transition-all ${filter === d ? 'bg-[var(--primary)] text-[var(--primary-text)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)]'} ${isNeo ? 'border-[2px] rounded-none shadow-[2px_2px_0_0_var(--text-main)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--text-main)]' : ''} ${isNeo && filter === d ? 'bg-[var(--primary)] text-black' : ''}`}
                    >
                        {d === 'all' ? 'All Time' : d === '1' ? '24h' : `${d} Days`}
                    </button>
                ))}
             </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <MetricCard title="Total Workflows" value={aggregate.total_workflows || 0} sub="In Period" trend="up" isNeo={isNeo} />
            <MetricCard title="Avg Success Rate" value={`${successRate.toFixed(1)}%`} sub={successRate > 80 ? 'High Reliability' : 'Low Reliability'} trend={successRate > 80 ? 'up' : 'down'} isNeo={isNeo} />
            <MetricCard title="Total Spend" value={`$${(aggregate.total_cost || 0).toFixed(2)}`} sub="Platform Total" trend="down" isNeo={isNeo} />
            <MetricCard title="Avg Execution Time" value={`${(aggregate.avg_execution_time || 0).toFixed(1)}s`} sub="Per Workflow" isNeo={isNeo} />
            <MetricCard title="Elements Found" value={aggregate.total_elements || 0} sub="Total Elements" isNeo={isNeo} />
            <MetricCard title="Avg Elements/Run" value={aggregate.total_workflows > 0 ? ((aggregate.total_elements || 0) / aggregate.total_workflows).toFixed(1) : 0} sub="Per Workflow" isNeo={isNeo} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className={`lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] p-6 shadow-[var(--shadow-md)] h-[400px] ${isNeo ? 'border-[3px] shadow-[6px_6px_0_0_var(--text-main)] rounded-none' : ''}`}>
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Workflow Volume & Success</h3>
                <div className="h-[320px]">
                    <Line data={volumeData} options={chartOptions} />
                </div>
            </div>
            <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] p-6 shadow-[var(--shadow-md)] h-[400px] ${isNeo ? 'border-[3px] shadow-[6px_6px_0_0_var(--text-main)] rounded-none' : ''}`}>
                 <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Cost Breakdown</h3>
                 <div className="h-[320px]">
                    <Doughnut data={costData} options={{...chartOptions, plugins: { legend: { position: 'bottom' } }}} />
                 </div>
            </div>
        </div>

        {/* Table */}
        <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] shadow-[var(--shadow-md)] overflow-hidden ${isNeo ? 'border-[3px] shadow-[6px_6px_0_0_var(--text-main)] rounded-none' : ''}`}>
            <div className={`p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex justify-between items-center ${isNeo ? 'bg-[var(--text-main)] text-[var(--bg-surface)] border-b-[3px]' : ''}`}>
                <h3 className="font-bold text-lg">Recent Executions</h3>
                <button onClick={fetchMetrics} className={`px-3 py-1 text-sm font-semibold rounded-[var(--border-radius-sm)] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)] ${isNeo ? 'text-black border-2 border-black rounded-none shadow-[2px_2px_0_0_white]' : ''}`}>Refresh</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] text-xs uppercase font-semibold">
                            <th className="p-4 border-b border-[var(--border-color)]">Status</th>
                            <th className="p-4 border-b border-[var(--border-color)]">Workflow ID</th>
                            <th className="p-4 border-b border-[var(--border-color)]">Timestamp</th>
                            <th className="p-4 border-b border-[var(--border-color)]">URL / Task</th>
                            <th className="p-4 border-b border-[var(--border-color)]">LLM Calls</th>
                            <th className="p-4 border-b border-[var(--border-color)]">Elements</th>
                            <th className="p-4 border-b border-[var(--border-color)]">Cost</th>
                            <th className="p-4 border-b border-[var(--border-color)]">Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {metrics.length === 0 ? (
                             <tr><td colSpan="8" className="p-8 text-center text-[var(--text-muted)]">No data available</td></tr>
                        ) : (
                            metrics.map((run, i) => (
                                <tr key={i} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-surface-secondary)]">
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${run.success_rate >= 1.0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} ${isNeo ? 'border border-black rounded-none' : ''}`}>
                                            {run.success_rate >= 1.0 ? 'PASS' : 'FAIL'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-xs">{run.workflow_id}</td>
                                    <td className="p-4">{new Date(run.timestamp).toLocaleString()}</td>
                                    <td className="p-4 max-w-[200px] truncate" title={run.url}>{run.url || 'N/A'}</td>
                                    <td className="p-4">{run.total_llm_calls}</td>
                                    <td className="p-4">{run.total_elements || 0}</td>
                                    <td className="p-4">${run.total_cost.toFixed(4)}</td>
                                    <td className="p-4">{run.execution_time.toFixed(1)}s</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

const MetricCard = ({ title, value, sub, trend, isNeo }) => (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] p-6 shadow-[var(--shadow-md)] flex flex-col justify-between h-full ${isNeo ? 'border-[3px] shadow-[6px_6px_0_0_var(--text-main)] rounded-none' : ''}`}>
        <div>
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">{title}</div>
            <div className="text-4xl font-extrabold text-[var(--text-main)] mb-2 font-display">{value}</div>
        </div>
        <div className="flex items-center gap-1 text-sm">
            {trend === 'up' && <ArrowUp size={16} className="text-[var(--success)]" />}
            {trend === 'down' && <ArrowDown size={16} className="text-[var(--error)]" />}
            <span className={trend === 'up' ? 'text-[var(--success)]' : trend === 'down' ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}>{sub}</span>
        </div>
    </div>
);

export default MetricsPage;
