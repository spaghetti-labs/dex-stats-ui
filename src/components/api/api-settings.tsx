import { Box, Button, TextField } from "@mui/material";
import * as React from "react";

export interface APISettings {
  apiKey?: string
}

export interface APISettingsManager {
  setApiKey(apiKey: string): void
  set(settings: APISettings): void
}

const apiSettingsContext = React.createContext<APISettings>(null)
const apiSettingsManagerContext = React.createContext<APISettingsManager>(null)

export function useApiSettings(): APISettings | null {
  return React.useContext(apiSettingsContext)
}

export function useApiSettingsManager(): APISettingsManager | null {
  return React.useContext(apiSettingsManagerContext)
}

const localStorageKey = 'dex-stats-api/ui/api/settings'

export function APISettingsRoot({
  children,
}: {
  children: any,
}) {
  const [settings, setSettings] = React.useState<APISettings>()
  React.useEffect(() => {
    function load() {
      const json = localStorage.getItem(localStorageKey)
      if (json == null) {
        setSettings({})
      } else {
        setSettings(JSON.parse(json))
      }
    }

    function listener(e: StorageEvent) {
      if (e.key === this.localStorageKey) {
        load();
      }
    }
    window.addEventListener('storage', listener)

    load()

    return () => window.removeEventListener('storage', listener)
  }, [localStorageKey, setSettings]);

  function update(settings: APISettings) {
    localStorage.setItem(localStorageKey, JSON.stringify(settings))
    setSettings(settings)
  }

  const manager: APISettingsManager = React.useMemo(() => {
    return {
      setApiKey(apiKey: string) {
        update({
          ...settings,
          apiKey,
        })
      },
      set(settings: APISettings) {
        update(settings)
      },
    }
  }, [ settings, setSettings ]);

  return <apiSettingsManagerContext.Provider value={manager}>
    <apiSettingsContext.Provider value={settings} children={children} />
  </apiSettingsManagerContext.Provider>
}

export function APISettings() {
  const settings = useApiSettings()
  const manager = useApiSettingsManager()
  const [unsavedSettings, setUnsavedSettings] = React.useState<APISettings>(settings)
  React.useEffect(() => {
    setUnsavedSettings(settings)
  }, [setUnsavedSettings, settings])

  function onSave() {
    manager.set(unsavedSettings)
  }

  const hasUnsaved = JSON.stringify(settings) !== JSON.stringify(unsavedSettings)

  return <Box display='flex' gap={2} p={2} flexDirection='column' alignItems='stretch'>
    <TextField label="API Key" variant="outlined" value={unsavedSettings?.apiKey} onChange={(e) => {
      setUnsavedSettings({
        ...unsavedSettings,
        apiKey: e.target.value,
      })
    }} />
    <Button onClick={onSave} disabled={!hasUnsaved}>Save</Button>
  </Box>
}
