// Type declarations for CSS module imports
declare module "*.css" {
  const content: Record<string, string>
  export default content
}

interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string
          callback: (response: { credential: string }) => void
          auto_select?: boolean
          use_fedcm_for_prompt?: boolean
        }) => void
        prompt: (
          notificationCallback?: (notification: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
            isDismissedMoment: () => boolean
            getNotDisplayedReason: () => string
            getSkippedReason: () => string
            getDismissedReason: () => string
          }) => void
        ) => void
        renderButton: (
          parent: HTMLElement,
          options?: {
            theme?: "outline" | "filled_blue"
            size?: "large" | "medium" | "small"
            shape?: "rectangular" | "pill" | "circle" | "square"
            text?: "signin_with" | "signup_with" | "continue_with" | "signin"
            width?: number
          }
        ) => void
      }
    }
  }
}
