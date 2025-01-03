import React, { createContext, useContext, useState, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { useNotifications } from './NotificationContext';

export interface DbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface DatabaseContextType {
  db: Database | null;
  isConnected: boolean;
  connect: (config: DbConfig) => Promise<void>;
  config: DbConfig;
  setConfig: (config: DbConfig) => void;
}

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning';
}

const DEFAULT_CONFIG: DbConfig = {
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'zoo_db'
} as const;

const DB_MESSAGES = {
  CONNECTION_SUCCESS: 'Úspěšně připojeno k MariaDB',
  CONNECTION_ERROR: 'Nepodařilo se připojit k databázi'
} as const;

const createConnectionString = (config: DbConfig): string => {
  const { username, password, host, port, database } = config;
  return `mysql://${username}:${password}@${host}:${port}/${database}`;
};

const createNotificationId = (type: string): string => `db_${type}_${Date.now()}`;

const createNotification = (
  type: string,
  title: string,
  message: string,
  notificationType: NotificationPayload['type']
): NotificationPayload => ({
  id: createNotificationId(type),
  title,
  message,
  type: notificationType
});

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : DB_MESSAGES.CONNECTION_ERROR;
};

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<Database | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<DbConfig>(DEFAULT_CONFIG);
  const { addNotification } = useNotifications();

  const connect = async (connectionConfig: DbConfig): Promise<void> => {
    try {
      const connectionString = createConnectionString(connectionConfig);
      const database = await Database.load(connectionString);
      
      setDb(database);
      setIsConnected(true);
      setConfig(connectionConfig);
      
      addNotification(createNotification(
        'connected',
        'Připojeno k databázi',
        DB_MESSAGES.CONNECTION_SUCCESS,
        'success'
      ));
    } catch (error) {
      setIsConnected(false);
      
      addNotification(createNotification(
        'error',
        'Chyba připojení',
        getErrorMessage(error),
        'warning'
      ));
      
      throw error;
    }
  };

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await connect(DEFAULT_CONFIG);
      } catch (error) {
        console.error('Initial connection error:', error);
      }
    };

    initializeConnection();
  }, []);

  const contextValue: DatabaseContextType = {
    db,
    isConnected,
    connect,
    config,
    setConfig
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export type { NotificationPayload };