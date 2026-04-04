/// <reference types="next" />

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          prompt: (callback?: () => void) => void
        }
      }
    }
  }
}

export {}
