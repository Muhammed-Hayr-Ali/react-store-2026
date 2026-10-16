export interface StaffAccessRole {
  id: string
  name: string
  description: string | null
  permissions: string[]
  created_at: string
}

export interface UserWithRoles {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  profile_image: string | null
  roles: StaffAccessRole[]
}

export interface StaffAccessPageData {
  users: UserWithRoles[]
  roles: StaffAccessRole[]
  summary: {
    total: number
    assigned: number
    unassigned: number
  }
  isMobile: boolean
}
