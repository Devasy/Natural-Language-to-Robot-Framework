import React from 'react';

const LogViewer = ({ logs, type, isCollapsed, toggleCollapse, onExpand }) => {
  // Auto-scroll to bottom when logs update
  const logsEndRef = React.useRef(null);

  React.useEffect(() => {
    if (!isCollapsed && logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isCollapsed]);

  // If logs update and it's collapsed, we might want to show a badge or something,
  // but for now we'll stick to manual control unless it's the first log.

  if (!logs || logs.length === 0) {
      if (isCollapsed) return null;
      return (
        <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
            <div className="mb-4 text-4xl opacity-50">{type === 'generation' ? '🎬' : '📋'}</div>
            <p>Test {type} logs will appear here</p>
        </div>
      );
  }

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-[400px] overflow-y-auto'}`}>
      <div className="font-mono text-sm p-4 space-y-2">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-2.5 rounded-[var(--border-radius-sm)] border-l-4 animate-[slideIn_0.2s_ease-out] whitespace-pre-wrap ${
              log.status === 'error' ? 'border-[var(--error)] bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300' :
              log.status === 'success' ? 'border-[var(--success)] bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300' :
              'border-[var(--primary)] bg-gray-50 dark:bg-gray-800 text-[var(--text-main)]'
            }`}
          >
            <div className="text-xs opacity-70 mb-1">[{new Date(log.timestamp).toLocaleTimeString()}]</div>
            <div dangerouslySetInnerHTML={{ __html: log.message }}></div>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default LogViewer;
