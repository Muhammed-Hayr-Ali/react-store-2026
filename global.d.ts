// Type declarations for CSS module imports
declare module "*.css" {
  const content: Record<string, string>
  export default content
}

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
