// Browser-compatible JavaScript Notebook using React from CDN
// Using global React objects instead of ES6 imports

const { useState, useRef, useEffect } = React;

// Simple icon components to replace lucide-react
const PlayIcon = () => React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}, React.createElement('polygon', { points: '5 3 19 12 5 21 5 3' }));

const PlusIcon = () => React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}, React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }), React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 }));

const Trash2Icon = () => React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}, React.createElement('path', { d: 'M3 6h18' }), React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }), React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }), React.createElement('line', { x1: 10, y1: 11, x2: 10, y2: 17 }), React.createElement('line', { x1: 14, y1: 11, x2: 14, y2: 17 }));

const CodeIcon = () => React.createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}, React.createElement('polyline', { points: '16 18 22 12 16 6' }), React.createElement('polyline', { points: '8 6 2 12 8 18' }));

const CodeEditor = ({ value, onChange, onRun }) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  const handleKeyDown = (e) => {
    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Reset cursor position (must wait for re-render)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }

    // Cmd/Ctrl + Enter to run
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onRun();
    }
  };

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const highlightedCode = typeof Prism !== 'undefined' 
    ? Prism.highlight(value || '', Prism.languages.javascript, 'javascript')
    : value;

  return React.createElement('div', { className: 'code-editor-container h-48' },
    React.createElement('div', {
      ref: highlightRef,
      className: 'code-editor-highlight language-javascript',
      dangerouslySetInnerHTML: { __html: highlightedCode + '\n' }
    }),
    React.createElement('textarea', {
      ref: textareaRef,
      value: value,
      onChange: (e) => onChange(e.target.value),
      onKeyDown: handleKeyDown,
      onScroll: handleScroll,
      className: 'code-editor-textarea',
      spellCheck: false,
      placeholder: 'Type your code here...'
    })
  );
};

const JavaScriptNotebook = () => {
  const [blocks, setBlocks] = useState([
    { id: 1, code: '// Write your JavaScript code here\nconst result = 2 + 2;\nconsole.log("Hello from console!");\nresult;', output: null, logs: [], error: null, hasRun: false, execCount: 0 }
  ]);
  const sharedScope = useRef({});
  const nextId = useRef(2);

  const extractVariableNames = (code) => {
    const matches = code.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    const names = [];
    for (const match of matches) {
      names.push(match[1]);
    }
    return names;
  };

  const executeCode = (blockId) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        const capturedLogs = [];
        const originalLog = console.log;
        
        // Temporary console.log override
        const tempConsole = {
          log: (...args) => {
            capturedLogs.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
            originalLog(...args);
          }
        };

        try {
          const allVars = Object.keys(sharedScope.current);
          const newVars = extractVariableNames(block.code);
          
          // Execute in a clean context with shared scope
          const result = (function(console) {
            // Import all shared variables into this scope
            for (let key in sharedScope.current) {
              eval(`var ${key} = sharedScope.current['${key}'];`);
            }
            
            // Execute user code (with const/let converted to var)
            const userCode = block.code.replace(/\b(const|let)\b/g, 'var');
            const evalResult = eval(userCode);
            
            // Capture all variables back to shared scope
            newVars.forEach(name => {
              try {
                sharedScope.current[name] = eval(name);
              } catch(e) {}
            });
            
            // Update modified variables
            allVars.forEach(key => {
              try {
                sharedScope.current[key] = eval(key);
              } catch(e) {}
            });
            
            return evalResult;
          })(tempConsole);
          
          return { ...block, output: result, logs: capturedLogs, error: null, hasRun: true, lastRun: Date.now(), execCount: (block.execCount || 0) + 1 };
        } catch (error) {
          return { ...block, output: null, logs: capturedLogs, error: error.message, hasRun: true, lastRun: Date.now(), execCount: (block.execCount || 0) + 1 };
        }
      }
      return block;
    }));
  };

  const addBlock = () => {
    const newBlock = {
      id: nextId.current++,
      code: '// New code block\n',
      output: null,
      error: null,
      hasRun: false
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const deleteBlock = (blockId) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(block => block.id !== blockId));
    }
  };

  const updateCode = (blockId, newCode) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, code: newCode } : block
    ));
  };

  const clearAllOutputs = () => {
    setBlocks(prev => prev.map(block => ({ ...block, output: null, logs: [], error: null, hasRun: false })));
    sharedScope.current = {};
  };

  const runAllBlocks = () => {
    sharedScope.current = {};
    setBlocks(prev => prev.map(block => {
      const capturedLogs = [];
      const originalLog = console.log;
      const tempConsole = {
        log: (...args) => {
          capturedLogs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
          originalLog(...args);
        }
      };

      try {
        const setupCode = Object.keys(sharedScope.current)
          .map(key => `var ${key} = __sharedScope['${key}'];`)
          .join('\n');
        
        const varNames = extractVariableNames(block.code);
        const captureCode = varNames
          .map(name => `try { __sharedScope['${name}'] = ${name}; } catch(e) {}`)
          .join('\n');
        
        const result = (function(__sharedScope, console) {
          const code = setupCode + '\n' + block.code;
          const wrappedCode = code.replace(/\b(const|let)\b/g, 'var');
          return eval(wrappedCode);
        })(sharedScope.current, tempConsole);
        
        // Capture variables
        (function(__sharedScope, console) {
          const captureFullCode = setupCode + '\n' + block.code.replace(/\b(const|let)\b/g, 'var') + '\n' + captureCode;
          eval(captureFullCode);
        })(sharedScope.current, tempConsole);
        
        return { ...block, output: result, logs: capturedLogs, error: null, hasRun: true };
      } catch (error) {
        return { ...block, output: null, logs: capturedLogs, error: error.message, hasRun: true };
      }
    }));
  };

  return React.createElement('div', { className: 'min-h-screen bg-gray-900 text-gray-100 p-6' }, 
    React.createElement('div', { className: 'max-w-5xl mx-auto' },
      // Header
      React.createElement('div', { className: 'mb-6 flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement(CodeIcon, { className: 'w-8 h-8 text-blue-400' }),
          React.createElement('h1', { className: 'text-3xl font-bold' }, 'JavaScript Notebook')
        ),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', {
            onClick: runAllBlocks,
            className: 'px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition'
          },
            React.createElement(PlayIcon, { className: 'w-4 h-4' }),
            'Run All'
          ),
          React.createElement('button', {
            onClick: clearAllOutputs,
            className: 'px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition'
          },
            'Clear Outputs'
          )
        )
      ),

      // Global Context Display
      Object.keys(sharedScope.current).length > 0 && 
        React.createElement('div', { className: 'mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-400 mb-2' }, 'Global Variables:'),
          React.createElement('div', { className: 'text-sm font-mono text-blue-300' },
            Object.entries(sharedScope.current).map(([key, value]) =>
              React.createElement('div', { key: key },
                React.createElement('span', { className: 'text-purple-400' }, key),
                ': ',
                JSON.stringify(value)
              )
            )
          )
        ),

      // Code Blocks
      React.createElement('div', { className: 'space-y-4' },
        blocks.map((block, index) =>
          React.createElement('div', { key: block.id, className: 'bg-gray-800 rounded-lg border border-gray-700 overflow-hidden' },
            // Block Header
            React.createElement('div', { className: 'flex items-center justify-between px-4 py-2 bg-gray-700 border-b border-gray-600' },
              React.createElement('span', { className: 'text-sm text-gray-400' },
                'Block ' + (index + 1) + (block.execCount > 0 ? ' (run ' + block.execCount + 'x)' : '')
              ),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', {
                  onClick: () => executeCode(block.id),
                  className: 'px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center gap-1 transition'
                },
                  React.createElement(PlayIcon, { className: 'w-3 h-3' }),
                  'Run'
                ),
                React.createElement('button', {
                  onClick: () => deleteBlock(block.id),
                  className: 'px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-1 transition',
                  disabled: blocks.length === 1
                },
                  React.createElement(Trash2Icon, { className: 'w-3 h-3' }),
                  'Delete'
                )
              )
            ),

            // Improved Code Editor
            React.createElement(CodeEditor, {
              value: block.code,
              onChange: (newCode) => updateCode(block.id, newCode),
              onRun: () => executeCode(block.id)
            }),

            // Output & Logs
            block.hasRun &&
              React.createElement('div', { className: 'border-t border-gray-700 p-4 bg-gray-850' },
                block.error ?
                  React.createElement('div', { className: 'text-red-400 font-mono text-sm' },
                    React.createElement('div', { className: 'font-semibold mb-1' }, 'Error:'),
                    block.error
                  ) :
                  React.createElement('div', { className: 'space-y-3' },
                    // Logs section
                    block.logs && block.logs.length > 0 && 
                      React.createElement('div', { className: 'text-gray-300 font-mono text-sm' },
                        React.createElement('div', { className: 'font-semibold mb-1 text-gray-500 text-xs uppercase' }, 'Console:'),
                        block.logs.map((log, i) => React.createElement('div', { key: i, className: 'pl-2 border-l-2 border-gray-700' }, log))
                      ),
                    // Return Value section
                    React.createElement('div', { className: 'text-green-400 font-mono text-sm' },
                      React.createElement('div', { className: 'font-semibold mb-1 text-gray-500 text-xs uppercase' }, 'Return Value:'),
                      block.output === undefined ? 'undefined' :
                      typeof block.output === 'object' ?
                        JSON.stringify(block.output, null, 2) :
                        String(block.output)
                    )
                  )
              )
          )
        )
      ),

      // Add Block Button
      React.createElement('button', {
        onClick: addBlock,
        className: 'mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center gap-2 transition'
      },
        React.createElement(PlusIcon, { className: 'w-5 h-5' }),
        'Add Code Block'
      ),

      // Instructions
      React.createElement('div', { className: 'mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-400' },
        React.createElement('h3', { className: 'font-semibold mb-2 text-gray-300' }, 'How to use:'),
        React.createElement('ul', { className: 'list-disc list-inside space-y-1' },
          React.createElement('li', null, 'Write JavaScript code in each block and click "Run" to execute'),
          React.createElement('li', null, 'Press ', React.createElement('kbd', { className: 'px-1 bg-gray-700 rounded text-gray-200' }, 'Cmd/Ctrl + Enter'), ' to run the current block'),
          React.createElement('li', null, 'Variables declared with const/let/var are shared across blocks'),
          React.createElement('li', null, 'The last expression in each block is returned as output'),
          React.createElement('li', null, 'Use "Run All" to execute all blocks in sequence'),
          React.createElement('li', null, 'Try: Define a variable in one block and use it in the next!')
        ),
        
        React.createElement('div', { className: 'mt-4 p-3 bg-gray-900 rounded border border-gray-600' },
          React.createElement('h4', { className: 'font-semibold mb-2 text-yellow-400' }, 'Example:'),
          React.createElement('div', { className: 'font-mono text-xs space-y-2' },
            React.createElement('div', null,
              React.createElement('span', { className: 'text-gray-500' }, 'Block 1:'),
              React.createElement('span', { className: 'text-blue-300' }, ' const x = 10;')
            ),
            React.createElement('div', null,
              React.createElement('span', { className: 'text-gray-500' }, 'Block 2:'),
              React.createElement('span', { className: 'text-blue-300' }, ' const y = x * 2; y;')
            ),
            React.createElement('div', null,
              React.createElement('span', { className: 'text-gray-500' }, 'Block 3:'),
              React.createElement('span', { className: 'text-blue-300' }, ' x + y;')
            )
          )
        )
      )
    )
  );
};

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(JavaScriptNotebook));