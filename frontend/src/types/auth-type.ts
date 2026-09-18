export interface AuthResponse {
  token: string
  user: User
}

export interface User {
  id: number
  name: string
  username: string
  email: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
}
