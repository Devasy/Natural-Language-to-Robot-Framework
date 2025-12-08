import React, { useState, useEffect } from 'react';
import { Play, Zap, Download, Copy, Check } from 'lucide-react';
import LogViewer from '../components/LogViewer';

const MainPage = ({ theme }) => {
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, generating, executing
  const [generationLogs, setGenerationLogs] = useState([]);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [showGenLogs, setShowGenLogs] = useState(true);
  const [showExecLogs, setShowExecLogs] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Format execution logs similar to previous implementation
  const formatExecutionLog = (rawLogs) => {
     if (!rawLogs) return [];

     // This is a simplified parser. In reality, we might receive streaming chunks.
     // Assuming we get the full log string or chunks that we append.
     // For this component, let's assume `executionLogs` is an array of objects { timestamp, message, status }
     return rawLogs;
  };

  const handleGenerate = async () => {
    if (!query.trim()) return;

    setStatus('generating');
    setGenerationLogs([]);
    setShowGenLogs(true);
    setStatusMessage('Starting generation...');

    try {
      const response = await fetch('/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model: "gemini-1.5-pro-latest" }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.substring(5));

            if (data.status === 'running') {
                setGenerationLogs(prev => [...prev, {
                    timestamp: new Date(),
                    message: data.message,
                    status: 'info'
                }]);
                setStatusMessage(data.message);
            } else if (data.status === 'complete') {
                setCode(data.robot_code);
                setStatus('idle');
                setStatusMessage('Generation complete');
                setGenerationLogs(prev => [...prev, {
                    timestamp: new Date(),
                    message: 'Generation complete',
                    status: 'success'
                }]);
            } else if (data.status === 'error') {
                setStatus('idle');
                setStatusMessage('Error during generation');
                setGenerationLogs(prev => [...prev, {
                    timestamp: new Date(),
                    message: data.message,
                    status: 'error'
                }]);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      setStatusMessage('Network error');
    }
  };

  const handleExecute = async () => {
    if (!code.trim()) return;

    setStatus('executing');
    setExecutionLogs([]);
    setShowExecLogs(true);
    setStatusMessage('Starting execution...');

    try {
        const response = await fetch('/execute-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ robot_code: code, user_query: query }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = JSON.parse(line.substring(5));

                    if (data.status === 'running') {
                        setExecutionLogs(prev => [...prev, {
                            timestamp: new Date(),
                            message: data.message,
                            status: 'info'
                        }]);
                        setStatusMessage(data.message);
                    } else if (data.status === 'complete') {
                        setStatus('idle');
                        // Format the final log block
                        let formattedLog = data.result.logs;
                         // Apply formatting logic (newlines, links)
                        formattedLog = formattedLog.replace(/Robot Framework Test Execution \(Exit Code: \d+\) =+ Suite:/g, (match) => `<br/><br/>${match}<br/>`)
                                                   .replace(/Detailed logs available in: (.*)/g, (match, path) => `Detailed logs available in: <span class="text-[var(--primary)] font-bold cursor-pointer hover:underline" title="${path}">${path}</span>`)
                                                   .replace(/Results: (\d+ passed, \d+ failed)/g, '<br/>Results: $1<br/>');

                        setExecutionLogs(prev => [...prev, {
                            timestamp: new Date(),
                            message: formattedLog,
                            status: data.test_status === 'passed' ? 'success' : 'error' // Simple check
                        }]);
                        setStatusMessage('Execution complete');
                    } else if (data.status === 'error') {
                        setStatus('idle');
                         setExecutionLogs(prev => [...prev, {
                            timestamp: new Date(),
                            message: data.message,
                            status: 'error'
                        }]);
                        setStatusMessage('Execution failed');
                    }
                }
            }
        }
    } catch (error) {
        setStatus('idle');
    }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated_test.robot';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 py-8 container mx-auto">
        <div className="text-center space-y-4 mb-12">
            <h1 className={`text-6xl font-extrabold tracking-tight text-[var(--text-main)] ${theme === 'neobrutalism' ? 'uppercase glitch' : ''}`} data-text="AI TEST AUTOMATION">
                AI TEST AUTOMATION
            </h1>
            <p className={`text-xl text-[var(--text-secondary)] max-w-2xl mx-auto ${theme === 'neobrutalism' ? 'bg-[var(--text-main)] text-[var(--bg-surface)] inline-block p-2 font-bold rotate-1 font-mono' : ''}`}>
                Transform descriptions into Robot Framework tests. Fast. Reliable. Automated.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <div className={`flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] shadow-[var(--shadow-md)] overflow-hidden ${theme === 'neobrutalism' ? 'border-[3px] shadow-[8px_8px_0_0_var(--text-main)] rounded-none' : ''}`}>
                <div className={`p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface-secondary)] ${theme === 'neobrutalism' ? 'bg-[var(--text-main)] text-[var(--bg-surface)] border-b-[3px]' : ''}`}>
                    <h2 className="text-lg font-bold flex items-center gap-2">Test Description</h2>
                    <p className={`text-sm ${theme === 'neobrutalism' ? 'text-gray-300' : 'text-[var(--text-secondary)]'}`}>Describe your test scenario in plain English</p>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Examples:&#10;• Open Google, search for 'Robot Framework tutorials', and click the first result&#10;• Navigate to GitHub, search for 'selenium automation'..."
                        className={`w-full flex-1 min-h-[250px] p-4 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[var(--border-radius)] text-[var(--text-main)] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${theme === 'neobrutalism' ? 'border-[3px] border-[var(--text-main)] rounded-none focus:shadow-[8px_8px_0_0_var(--primary)] focus:ring-0' : ''}`}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={status !== 'idle' || !query.trim()}
                        className={`w-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-lg rounded-[var(--border-radius)] transition-all ${theme === 'neobrutalism' ? 'bg-[var(--primary)] text-[var(--primary-text)] border-[3px] border-[var(--text-main)] shadow-[6px_6px_0_0_var(--text-main)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_var(--text-main)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none uppercase' : 'bg-[var(--primary)] text-[var(--primary-text)] hover:bg-[var(--primary-hover)] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        {status === 'generating' ? (
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Zap size={20} />
                        )}
                        {status === 'generating' ? 'Generating...' : 'Generate Test'}
                    </button>
                </div>
            </div>

            {/* Code Section */}
             <div className={`flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] shadow-[var(--shadow-md)] overflow-hidden ${theme === 'neobrutalism' ? 'border-[3px] shadow-[8px_8px_0_0_var(--text-main)] rounded-none' : ''}`}>
                <div className={`p-6 border-b border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex justify-between items-center ${theme === 'neobrutalism' ? 'bg-[var(--text-main)] text-[var(--bg-surface)] border-b-[3px]' : ''}`}>
                    <div>
                        <h2 className="text-lg font-bold">Generated Code</h2>
                        <p className={`text-sm ${theme === 'neobrutalism' ? 'text-gray-300' : 'text-[var(--text-secondary)]'}`}>Robot Framework test script</p>
                    </div>
                    {code && (
                        <div className="flex gap-2">
                            <button onClick={handleCopy} className={`p-2 rounded hover:bg-white/10 ${copied ? 'text-green-400' : ''}`} title="Copy Code">
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                             <button onClick={handleDownload} className="p-2 rounded hover:bg-white/10" title="Download">
                                <Download size={18} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className={`relative flex-1 bg-[#1e1e1e] rounded-[var(--border-radius)] overflow-hidden border border-[var(--border-color)] ${theme === 'neobrutalism' ? 'border-[3px] border-[var(--text-main)] rounded-none' : ''}`}>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Generated Robot Framework code will appear here..."
                            className="w-full h-full min-h-[300px] p-6 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm resize-none focus:outline-none"
                            spellCheck="false"
                        />
                         {code && <div className={`absolute top-3 right-4 text-xs font-mono uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded ${theme === 'neobrutalism' ? 'bg-[var(--primary)] text-black font-bold rounded-none' : ''}`}>robot framework</div>}
                    </div>
                    <button
                        onClick={handleExecute}
                        disabled={status !== 'idle' || !code.trim()}
                        className={`w-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-lg rounded-[var(--border-radius)] transition-all ${theme === 'neobrutalism' ? 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[3px] border-[var(--text-main)] shadow-[4px_4px_0_0_var(--text-main)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--text-main)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none uppercase' : 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-color)] hover:bg-[var(--bg-surface-secondary)] shadow-md disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                         {status === 'executing' ? (
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Play size={20} />
                        )}
                        {status === 'executing' ? 'Executing...' : 'Execute Test'}
                    </button>
                </div>
            </div>
        </div>

        {/* Logs Sections */}
        {generationLogs.length > 0 && (
             <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] shadow-[var(--shadow-md)] overflow-hidden ${theme === 'neobrutalism' ? 'border-[3px] shadow-[8px_8px_0_0_var(--text-main)] rounded-none' : ''}`}>
                <div className={`p-4 border-b border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex justify-between items-center cursor-pointer ${theme === 'neobrutalism' ? 'bg-[var(--text-main)] text-[var(--bg-surface)] border-b-[3px]' : ''}`} onClick={() => setShowGenLogs(!showGenLogs)}>
                    <h3 className="font-bold flex items-center gap-2">Generation Logs</h3>
                    <span className="text-sm">{showGenLogs ? 'Collapse' : 'Expand'}</span>
                </div>
                {showGenLogs && <LogViewer logs={generationLogs} type="generation" isCollapsed={false} />}
             </div>
        )}

         {executionLogs.length > 0 && (
             <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[var(--border-radius)] shadow-[var(--shadow-md)] overflow-hidden ${theme === 'neobrutalism' ? 'border-[3px] shadow-[8px_8px_0_0_var(--text-main)] rounded-none' : ''}`}>
                <div className={`p-4 border-b border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex justify-between items-center cursor-pointer ${theme === 'neobrutalism' ? 'bg-[var(--text-main)] text-[var(--bg-surface)] border-b-[3px]' : ''}`} onClick={() => setShowExecLogs(!showExecLogs)}>
                    <h3 className="font-bold flex items-center gap-2">Execution Logs</h3>
                    <span className="text-sm">{showExecLogs ? 'Collapse' : 'Expand'}</span>
                </div>
                {showExecLogs && <LogViewer logs={executionLogs} type="execution" isCollapsed={false} />}
             </div>
        )}
    </div>
  );
};

export default MainPage;
