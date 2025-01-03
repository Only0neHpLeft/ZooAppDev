import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Database, RefreshCw, Table } from 'lucide-react';
import { testDatabaseConnection } from '../services/database';
import type { DbConfig } from '../contexts/DatabaseContext';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}

interface TableStatProps {
  name: string;
  count: number;
}

const STYLES = {
  input: 'w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300',
  label: 'block text-sm font-medium text-slate-300 mb-1',
  section: 'p-4 bg-slate-800/50 rounded-lg',
  statCard: 'p-3 bg-slate-900/50 rounded-lg',
  connectionString: 'p-3 bg-slate-900/50 rounded-lg font-mono text-sm text-slate-400',
  submitButton: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2'
} as const;

const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className={STYLES.label}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(type === 'number' ? e.target.value : e.target.value)}
      className={STYLES.input}
    />
  </div>
);

const ConnectionStatus: React.FC<{ isConnected: boolean }> = ({ isConnected }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
    <span className="text-sm text-slate-400">
      {isConnected ? 'Připojeno' : 'Odpojeno'}
    </span>
  </div>
);

const SubmitButton: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <button
    type="submit"
    disabled={isLoading}
    className={STYLES.submitButton}
  >
    {isLoading ? (
      <>
        <RefreshCw className="w-4 h-4 animate-spin" />
        Testování připojení...
      </>
    ) : (
      <>
        <Database className="w-4 h-4" />
        Otestovat připojení
      </>
    )}
  </button>
);

const TableStats: React.FC<{ results: TableStatProps[] }> = ({ results }) => (
  <div className={`mt-6 ${STYLES.section}`}>
    <div className="flex items-center gap-2 mb-4">
      <Table className="w-5 h-5 text-slate-400" />
      <h3 className="text-lg font-medium text-slate-300">Statistiky tabulek</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {results.map((result) => (
        <div key={result.name} className={STYLES.statCard}>
          <div className="text-sm text-slate-400">{result.name}</div>
          <div className="text-lg font-medium text-slate-300">{result.count} záznamů</div>
        </div>
      ))}
    </div>
  </div>
);

const ConnectionString: React.FC<{ config: DbConfig }> = ({ config }) => (
  <div className={STYLES.section}>
    <div className="flex items-center gap-3 mb-4">
      <Database className="w-5 h-5 text-slate-400" />
      <span className="text-slate-300 font-medium">Connection String</span>
    </div>
    <div className={STYLES.connectionString}>
      {`mysql://${config.username}:****@${config.host}:${config.port}/${config.database}`}
    </div>
  </div>
);

const DatabasePanel: React.FC = () => {
  const { config, connect, isConnected, db } = useDatabase();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<DbConfig>(config);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<TableStatProps[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingConnection(true);
    
    try {
      await connect(formData);
      const results = db ? await testDatabaseConnection(db) : [];
      setTestResults(results);
      
      addNotification({
        id: `db_test_${Date.now()}`,
        title: 'Připojení úspěšné',
        message: 'Připojení k databázi bylo úspěšně otestováno',
        type: 'success'
      });
    } catch (err) {
      addNotification({
        id: `db_error_${Date.now()}`,
        title: 'Chyba připojení',
        message: err instanceof Error ? err.message : 'Nepodařilo se připojit k databázi',
        type: 'warning'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleInputChange = (field: keyof DbConfig) => (value: string) => {
    setFormData((prev: DbConfig) => ({
      ...prev,
      [field]: field === 'port' ? parseInt(value) : value
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Host"
            value={formData.host}
            onChange={handleInputChange('host')}
          />
          <FormInput
            label="Port"
            value={formData.port}
            onChange={handleInputChange('port')}
            type="number"
          />
        </div>

        <FormInput
          label="Databáze"
          value={formData.database}
          onChange={handleInputChange('database')}
        />
        <FormInput
          label="Uživatelské jméno"
          value={formData.username}
          onChange={handleInputChange('username')}
        />
        <FormInput
          label="Heslo"
          value={formData.password}
          onChange={handleInputChange('password')}
          type="password"
        />

        <div className="flex items-center justify-between pt-4">
          <ConnectionStatus isConnected={isConnected} />
          <SubmitButton isLoading={isTestingConnection} />
        </div>
      </form>

      {testResults.length > 0 && <TableStats results={testResults} />}
      <ConnectionString config={config} />
    </div>
  );
};

export type { FormInputProps, TableStatProps };
export default DatabasePanel;