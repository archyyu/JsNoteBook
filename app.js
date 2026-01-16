import React, { useState, useRef } from 'react';
import { Play, Plus, Trash2, Code } from 'lucide-react';

const JavaScriptNotebook = () => {
  const [blocks, setBlocks] = useState([
    { id: 1, code: '// Write your JavaScript code here\nconst result = 2 + 2;\nresult;', output: null, error: null, hasRun: false, execCount: 0 }
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
        try {
          const allVars = Object.keys(sharedScope.current);
          const newVars = extractVariableNames(block.code);
          
          // Execute in a clean context with shared scope
          const result = (function() {
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
          })();
          
          return { ...block, output: result, error: null, hasRun: true, lastRun: Date.now(), execCount: (block.execCount || 0) + 1 };
        } catch (error) {
          return { ...block, output: null, error: error.message, hasRun: true, lastRun: Date.now(), execCount: (block.execCount || 0) + 1 };
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
    setBlocks(prev => prev.map(block => ({ ...block, output: null, error: null, hasRun: false })));
    sharedScope.current = {};
  };

  const runAllBlocks = () => {
    sharedScope.current = {};
    setBlocks(prev => prev.map(block => {
      try {
        const setupCode = Object.keys(sharedScope.current)
          .map(key => `var ${key} = __sharedScope['${key}'];`)
          .join('\n');
        
        const varNames = extractVariableNames(block.code);
        const captureCode = varNames
          .map(name => `try { __sharedScope['${name}'] = ${name}; } catch(e) {}`)
          .join('\n');
        
        const result = (function(__sharedScope) {
          const code = setupCode + '\n' + block.code;
          const wrappedCode = code.replace(/\b(const|let)\b/g, 'var');
          return eval(wrappedCode);
        })(sharedScope.current);
        
        // Capture variables
        (function(__sharedScope) {
          const captureFullCode = setupCode + '\n' + block.code.replace(/\b(const|let)\b/g, 'var') + '\n' + captureCode;
          eval(captureFullCode);
        })(sharedScope.current);
        
        return { ...block, output: result, error: null, hasRun: true };
      } catch (error) {
        return { ...block, output: null, error: error.message, hasRun: true };
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">JavaScript Notebook</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runAllBlocks}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition"
            >
              <Play className="w-4 h-4" />
              Run All
            </button>
            <button
              onClick={clearAllOutputs}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Clear Outputs
            </button>
          </div>
        </div>

        {/* Global Context Display */}
        {Object.keys(sharedScope.current).length > 0 && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Global Variables:</h3>
            <div className="text-sm font-mono text-blue-300">
              {Object.entries(sharedScope.current).map(([key, value]) => (
                <div key={key}>
                  <span className="text-purple-400">{key}</span>: {JSON.stringify(value)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Blocks */}
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              {/* Block Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-750 border-b border-gray-700">
                <span className="text-sm text-gray-400">Block {index + 1} {block.execCount > 0 && `(run ${block.execCount}x)`}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => executeCode(block.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center gap-1 transition"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-1 transition"
                    disabled={blocks.length === 1}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <textarea
                value={block.code}
                onChange={(e) => updateCode(block.id, e.target.value)}
                className="w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
                rows={6}
                spellCheck={false}
              />

              {/* Output */}
              {block.hasRun && (
                <div className="border-t border-gray-700 p-4 bg-gray-850">
                  {block.error ? (
                    <div className="text-red-400 font-mono text-sm">
                      <div className="font-semibold mb-1">Error:</div>
                      {block.error}
                    </div>
                  ) : (
                    <div className="text-green-400 font-mono text-sm">
                      <div className="font-semibold mb-1 text-gray-400">Output:</div>
                      {block.output === undefined ? 'undefined' : 
                       typeof block.output === 'object' 
                        ? JSON.stringify(block.output, null, 2)
                        : String(block.output)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Block Button */}
        <button
          onClick={addBlock}
          className="mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Add Code Block
        </button>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-400">
          <h3 className="font-semibold mb-2 text-gray-300">How to use:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Write JavaScript code in each block and click "Run" to execute</li>
            <li>Variables declared with const/let/var are shared across blocks</li>
            <li>The last expression in each block is returned as output</li>
            <li>Use "Run All" to execute all blocks in sequence</li>
            <li>Try: Define a variable in one block and use it in the next!</li>
          </ul>
          
          <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-600">
            <h4 className="font-semibold mb-2 text-yellow-400">Example:</h4>
            <div className="font-mono text-xs space-y-2">
              <div><span className="text-gray-500">Block 1:</span> <span className="text-blue-300">const x = 10;</span></div>
              <div><span className="text-gray-500">Block 2:</span> <span className="text-blue-300">const y = x * 2; y;</span></div>
              <div><span className="text-gray-500">Block 3:</span> <span className="text-blue-300">x + y;</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JavaScriptNotebook;
