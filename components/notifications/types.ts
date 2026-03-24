export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "order" | "promo" | string
  is_read: boolean
  link: string | null
  created_at: string
  updated_at: string
}
