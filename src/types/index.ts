export interface UserProfile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  country_count: number
  city_count: number
  created_at: string
}

export interface Visit {
  id: string
  user_id: string
  country_code: string  // ISO 3166-1 alpha-2
  country_name: string
  city: string | null
  lat: number | null
  lng: number | null
  visited_at: string
  notes: string | null
  created_at: string
  photos?: Photo[]
}

export interface Photo {
  id: string
  visit_id: string
  url: string
  caption: string | null
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface FeedItem {
  id: string
  user: UserProfile
  visit: Visit
  created_at: string
}
