import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Play, Code, Database as DatabaseIcon, ArrowLeft,
  Lightbulb, Save, Copy, RotateCcw, Check
} from 'lucide-react';
import { categories } from '../data/tasks';
import { useTaskCompletion } from '../hooks/useTaskCompletion';
import { useNotifications } from '../contexts/NotificationContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { ROUTES } from '../navigation'

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ResultsAreaProps {
  error: string | null;
  isExecuting: boolean;
  result: { columns: string[]; rows: any[] } | null;
}

type TabType = 'editor' | 'results';

const SAVED_CODE_PREFIX = 'saved_code_';
const KEYBOARD_SHORTCUTS = {
  run: 'Ctrl + Enter',
  save: 'Ctrl + S',
  reset: 'Ctrl + R'
} as const;

const BONUS_LETTERS = ['F', 'I', 'L', 'O', 'T', 'W', 'Z'] as const;

const ConnectionStatus: React.FC<{ isConnected: boolean }> = ({ isConnected }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
    isConnected ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'
  }`}>
    <div className={`w-2 h-2 rounded-full ${
      isConnected ? 'bg-emerald-500' : 'bg-red-500'
    }`} />
    {isConnected ? 'Připojeno k DB' : 'Odpojeno od DB'}
  </div>
);

const Editor: React.FC<EditorProps> = ({ code, onChange, placeholder }) => {
  const [currentLine, setCurrentLine] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const updateCurrentLine = (element: HTMLTextAreaElement) => {
    if (element) {
      const cursorPosition = element.selectionStart;
      const textBeforeCursor = element.value.substring(0, cursorPosition);
      const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
      setCurrentLine(line);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    updateCurrentLine(e.target);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    updateCurrentLine(e.currentTarget);
  };

  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div className="relative w-full h-full font-mono text-sm">
      <div className="absolute inset-0 grid grid-cols-[2.5rem,1fr]">
        <div className="bg-slate-900/50 border-r border-slate-800 select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="text-slate-600 text-right pr-3 h-6 leading-6">
              {String(num).padStart(2, '0')}
            </div>
          ))}
          <div className="text-slate-600 text-right pr-3 h-6 leading-6">
            {String(lineNumbers.length + 1).padStart(2, '0')}
          </div>
        </div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleInput}
            onClick={handleClick}
            onKeyUp={(e) => updateCurrentLine(e.currentTarget)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            spellCheck={false}
            className="w-full h-full resize-none py-0 px-4 bg-transparent text-slate-300 focus:outline-none font-mono text-sm leading-6"
            style={{ lineHeight: '1.5rem', minHeight: '100%', tabSize: 4 }}
            placeholder={placeholder}
          />
          {isFocused && (
            <div
              className="absolute pointer-events-none left-0 right-0 h-6 bg-slate-800/30"
              style={{ top: `${(currentLine - 1) * 1.5}rem` }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ResultsArea: React.FC<ResultsAreaProps> = ({ error, isExecuting, result }) => (
  <div className="p-4 overflow-auto h-full">
    {error ? (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400 font-medium mb-1">Chyba při vykonávání dotazu</p>
        <p className="text-red-400/80 text-sm">{error}</p>
      </div>
    ) : isExecuting ? (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
        <p className="text-sm">Vykonávám SQL dotaz...</p>
      </div>
    ) : result ? (
      <div className="rounded-lg overflow-hidden border border-slate-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800/50">
              {result.columns.map((column) => (
                <th key={column} className="px-4 py-2 text-left text-sm font-medium text-slate-300 border-b border-slate-700">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={index} className={`border-b border-slate-800 last:border-0 ${index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/50'}`}>
                {result.columns.map((column) => (
                  <td key={column} className="px-4 py-2 text-sm text-slate-400">
                    {row[column] === null ? (
                      <span className="text-slate-600">NULL</span>
                    ) : typeof row[column] === 'number' ? (
                      <span className="text-emerald-400">{row[column]}</span>
                    ) : (
                      row[column]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p className="text-center text-sm">
          Spusťte SQL dotaz pro zobrazení výsledků<br />
          <span className="text-xs text-slate-600 mt-1 block">
            Použijte {KEYBOARD_SHORTCUTS.run} pro spuštění
          </span>
        </p>
      </div>
    )}
  </div>
);

export const LiveEditor: React.FC = () => {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const { addNotification } = useNotifications();
  const { toggleTaskCompletion, completedTasks } = useTaskCompletion();

  const { db, isConnected } = useDatabase();
  const [code, setCode] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  const category = id ? Object.values(categories).find(cat => cat.letter === id.toUpperCase()) : null;
  const task = category?.tasks.find(t => t.id === taskId);
  const isBonus = category?.letter && BONUS_LETTERS.includes(category.letter as typeof BONUS_LETTERS[number]);

  useEffect(() => {
    if (taskId) {
      const savedCode = localStorage.getItem(`${SAVED_CODE_PREFIX}${taskId}`);
      if (savedCode) setCode(savedCode);
    }
  }, [taskId]);

  const handleRun = useCallback(async () => {
    if (isExecuting || !isConnected || !db) {
      if (!isConnected) {
        setTimeout(() => {
          addNotification({
            id: `db_not_connected_${Date.now()}`,
            title: 'Databáze není připojena',
            message: 'Prosím zkontrolujte připojení k databázi v nastavení',
            type: 'warning'
          });
        }, 0);
      }
      return;
    }

    setIsExecuting(true);
    setError(null);
    setActiveTab('results');
  
    try {
      const queryResult = await db.select(code);
  
      if (Array.isArray(queryResult) && queryResult.length > 0) {
        setResult({
          columns: Object.keys(queryResult[0]),
          rows: queryResult
        });
        
        if (taskId && !completedTasks[taskId]) {
          toggleTaskCompletion(taskId);
        }
      } else {
        setResult({ columns: [], rows: [] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při vykonávání dotazu');
      setActiveTab('results');
    } finally {
      setIsExecuting(false);
    }
  }, [db, isConnected, taskId, completedTasks, toggleTaskCompletion, isExecuting, code, addNotification]);

  useEffect(() => {
    const shouldShowNotification = result && taskId && !completedTasks[taskId];
    
    if (shouldShowNotification) {
      const timer = setTimeout(() => {
        addNotification({
          id: `task_complete_${taskId}`,
          title: 'Úkol dokončen!',
          message: 'Skvělá práce! Můžete pokračovat dalším úkolem.',
          type: 'success'
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [result, completedTasks, taskId, addNotification]);

  const handleSave = useCallback(() => {
    if (taskId) {
      localStorage.setItem(`${SAVED_CODE_PREFIX}${taskId}`, code);
      setTimeout(() => {
        addNotification({
          id: `save_code_${Date.now()}`,
          title: 'Kód uložen',
          message: 'Váš SQL kód byl úspěšně uložen',
          type: 'success'
        });
      }, 0);
    }
  }, [taskId, code, addNotification]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    setTimeout(() => {
      addNotification({
        id: `copy_code_${Date.now()}`,
        title: 'Kód zkopírován',
        message: 'SQL kód byl zkopírován do schránky',
        type: 'success'
      });
    }, 0);
  }, [code, addNotification]);

  const handleReset = useCallback(() => {
    if (confirm('Opravdu chcete resetovat kód? Neuložené změny budou ztraceny.')) {
      setCode('');
      if (taskId) {
        localStorage.removeItem(`${SAVED_CODE_PREFIX}${taskId}`);
      }
      setTimeout(() => {
        addNotification({
          id: `reset_code_${Date.now()}`,
          title: 'Kód resetován',
          message: 'Váš SQL kód byl resetován do výchozího stavu',
          type: 'info'
        });
      }, 0);
    }
  }, [taskId, addNotification]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.repeat) {
        switch (e.key.toLowerCase()) {
          case 'enter':
            e.preventDefault();
            void handleRun();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'r':
            e.preventDefault();
            handleReset();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleSave, handleReset]);

  if (!category || !task) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8">
        <Link 
          to={ROUTES.CATEGORY_DETAIL(':id')}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2"/>
          Zpět na úkoly
        </Link>
  
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-2xl font-bold ${
                isBonus ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent' : 'text-white'
              }`}>
                {task.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                task.difficulty === 'Lehké' ? 'bg-emerald-900/30 text-emerald-400' :
                task.difficulty === 'Střední' ? 'bg-amber-900/30 text-amber-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {task.difficulty}
              </span>
              {taskId && completedTasks[taskId] && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-900/30 text-emerald-400">
                  <Check className="w-3 h-3"/>
                  Dokončeno
                </span>
              )}
            </div>
            <p className="text-slate-400">{task.description}</p>
          </div>
  
          <div className="flex items-center gap-2">
            <ConnectionStatus isConnected={isConnected} />
            {task.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 border border-slate-800 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <Lightbulb className="w-4 h-4"/>
                {showHint ? 'Skrýt nápovědu' : 'Zobrazit nápovědu'}
              </button>
            )}
            <button
              onClick={handleReset}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
              title="Resetovat kód"
            >
              <RotateCcw className="w-4 h-4"/>
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-all relative group"
              title="Kopírovat kód"
            >
              <div className="relative w-4 h-4">
                <Copy
                  className={`w-4 h-4 absolute transition-all duration-200 ${isCopied ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}/>
                <Check
                  className={`w-4 h-4 absolute transition-all duration-200 text-emerald-400 ${isCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}/>
              </div>
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
              title="Uložit kód"
            >
              <Save className="w-4 h-4"/>
            </button>
            <button
              onClick={handleRun}
              disabled={isExecuting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4"/>
              {isExecuting ? 'Provádí se...' : 'Spustit SQL'}
            </button>
          </div>
        </div>
  
        {showHint && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg mt-4">
            <p className="text-sm text-indigo-300">{task.hint}</p>
          </div>
        )}
      </div>
  
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm overflow-hidden h-[600px]">
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'editor'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            <Code className="w-4 h-4"/>
            Editor SQL
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            <DatabaseIcon className="w-4 h-4"/>
            Výsledky
          </button>
        </div>
  
        <div className="relative h-[calc(100%-3rem)]">
          <div className={`absolute inset-0 transition-opacity duration-200 h-full ${
            activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}>
            <Editor code={code} onChange={setCode} placeholder="SELECT * FROM Zvirata AS Z"/>
          </div>
  
          <div className={`absolute inset-0 transition-opacity duration-200 overflow-auto h-full ${
            activeTab === 'results' ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}>
            <ResultsArea error={error} isExecuting={isExecuting} result={result}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ConnectionStatus };
export type { EditorProps, ResultsAreaProps };
export default LiveEditor;