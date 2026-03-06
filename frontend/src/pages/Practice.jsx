import { useState } from 'react';
import { Play, Code, Save, Trash2, Download } from 'lucide-react';

const Practice = () => {
  const [code, setCode] = useState(`// Write your code here
function helloWorld() {
  console.log("Hello, World!");
}

helloWorld();`);
  
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleRunCode = () => {
    try {
      // Capture console.log output
      let logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.join(' '));
      };

      // Execute the code safely
      eval(code);
      
      // Restore console.log
      console.log = originalLog;
      
      if (logs.length > 0) {
        setOutput(logs.join('\n'));
      } else {
        setOutput('Code executed successfully (no output)');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${Date.now()}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearCode = () => {
    setCode('// Write your code here\n');
    setOutput('');
  };

  return (
    <div className="practice">
      <div className="container">
        <div className="practice-header">
          <h1><Code size={32} /> Code Practice</h1>
          <p>Practice your coding skills with our built-in editor</p>
        </div>

        <div className="practice-toolbar">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python (coming soon)</option>
            <option value="java">Java (coming soon)</option>
          </select>
          
          <div className="toolbar-actions">
            <button onClick={handleClearCode} className="btn btn-secondary btn-sm">
              <Trash2 size={18} />
              Clear
            </button>
            <button onClick={handleSaveCode} className="btn btn-secondary btn-sm">
              <Download size={18} />
              Download
            </button>
            <button onClick={handleRunCode} className="btn btn-primary btn-sm">
              <Play size={18} />
              Run Code
            </button>
          </div>
        </div>

        <div className="practice-content">
          <div className="editor-container">
            <div className="editor-header">
              <h3>Code Editor</h3>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-editor"
              spellCheck="false"
              placeholder="Write your code here..."
            />
          </div>

          <div className="output-container">
            <div className="output-header">
              <h3>Output</h3>
            </div>
            <div className="code-output">
              <pre>{output || '// Output will appear here...'}</pre>
            </div>
          </div>
        </div>

        <div className="practice-tips">
          <h3>💡 Quick Tips</h3>
          <ul>
            <li>Use <code>console.log()</code> to print output</li>
            <li>Try writing functions and testing them</li>
            <li>Experiment with different JavaScript concepts</li>
            <li>Download your code to save it locally</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Practice;
