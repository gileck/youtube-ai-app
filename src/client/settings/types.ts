// Define the settings type
export interface Settings {
    aiModel: string;
}

// Define the settings context type
export interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    clearCache: () => Promise<{ success: boolean; message: string }>;
}

// Default settings
export const defaultSettings: Settings = {
    aiModel: '',
}; 