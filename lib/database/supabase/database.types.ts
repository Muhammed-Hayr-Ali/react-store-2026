export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          is_active: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          name_ar: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          name_ar?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          name_ar?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          description_ar: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          is_active: boolean | null
          name: string
          name_ar: string | null
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          city: string
          currency_code: string
          fetched_at: string
          id: string
          raw_buy: number
          raw_sell: number
          source_updated_at: string | null
          store_rate: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          city?: string
          currency_code: string
          fetched_at?: string
          id?: string
          raw_buy: number
          raw_sell: number
          source_updated_at?: string | null
          store_rate?: number | null
          unit?: string
          updated_at?: string
        }
        Update: {
          city?: string
          currency_code?: string
          fetched_at?: string
          id?: string
          raw_buy?: number
          raw_sell?: number
          source_updated_at?: string | null
          store_rate?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          status: string | null
          unsubscribe_reason: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string | null
          unsubscribe_reason?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string | null
          unsubscribe_reason?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          id: string
          otp_code: string | null
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          otp_code?: string | null
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          otp_code?: string | null
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      phone_otps: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone_number: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone_number: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone_number?: string
          used?: boolean | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          url: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          url: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_product_fkey"
            columns: ["variant_id", "product_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id", "product_id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_reviews_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json | null
          compare_at_price: number | null
          expiration_date: string | null
          id: string
          is_active: boolean
          low_stock_threshold: number
          name: string | null
          price: number
          product_id: string
          sku: string
          sort_order: number
          stock_quantity: number
          track_inventory: boolean
        }
        Insert: {
          attributes?: Json | null
          compare_at_price?: number | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          low_stock_threshold?: number
          name?: string | null
          price: number
          product_id: string
          sku: string
          sort_order?: number
          stock_quantity?: number
          track_inventory?: boolean
        }
        Update: {
          attributes?: Json | null
          compare_at_price?: number | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          low_stock_threshold?: number
          name?: string | null
          price?: number
          product_id?: string
          sku?: string
          sort_order?: number
          stock_quantity?: number
          track_inventory?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          category_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          ban_reason: string | null
          banned_at: string | null
          created_at: string
          email: string | null
          email_verified: boolean | null
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          phone: string | null
          phone_verified: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_banners: {
        Row: {
          badge_text: string | null
          badge_text_ar: string | null
          created_at: string
          cta_href: string | null
          cta_label: string | null
          cta_label_ar: string | null
          ends_at: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          is_active: boolean
          priority: number
          starts_at: string | null
          subtitle: string | null
          subtitle_ar: string | null
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          badge_text_ar?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          cta_label_ar?: string | null
          ends_at?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean
          priority?: number
          starts_at?: string | null
          subtitle?: string | null
          subtitle_ar?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          badge_text_ar?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          cta_label_ar?: string | null
          ends_at?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean
          priority?: number
          starts_at?: string | null
          subtitle?: string | null
          subtitle_ar?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_table_rls: {
        Args: {
          p_has_user_id?: boolean
          p_is_public: boolean
          p_owner_column?: string
          p_perm_base: string
          p_table: string
        }
        Returns: undefined
      }
      check_user_permission: {
        Args: { p_permission: string }
        Returns: boolean
      }
      check_user_role: { Args: { p_role_name: string }; Returns: boolean }
      get_admin_users_list: {
        Args: { p_search?: string; p_status?: string }
        Returns: {
          ban_reason: string
          banned_at: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string
          profile_image: string
          roles: string[]
          status: string
        }[]
      }
      get_current_user: { Args: never; Returns: Json }
      has_permission: {
        Args: { required_permission: string }
        Returns: boolean
      }
      inspect_brands_json: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      read_roles_and_permissions: { Args: never; Returns: Json }
      read_roles_and_permissions_by_id: {
        Args: { p_user_id: string }
        Returns: Json
      }
      seed_50_non_featured_products_ar: { Args: never; Returns: number }
      seed_admin_role: { Args: never; Returns: undefined }
      seed_supermarket_categories: { Args: never; Returns: number }
      upsert_exchange_rate: {
        Args: {
          p_city: string
          p_currency_code: string
          p_raw_buy: number
          p_raw_sell: number
          p_source_updated_at?: string
          p_unit?: string
        }
        Returns: {
          city: string
          currency_code: string
          fetched_at: string
          id: string
          raw_buy: number
          raw_sell: number
          source_updated_at: string | null
          store_rate: number | null
          unit: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "exchange_rates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      verify_and_use_reset_token: { Args: { p_token: string }; Returns: string }
    }
    Enums: {
      flash_sale_discount_type:
        | "percentage"
        | "fixed_amount"
        | "fixed_price"
        | "none"
      report_status: "pending" | "under_review" | "resolved" | "dismissed"
      report_target_type: "product" | "review" | "technical_issue" | "general"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      flash_sale_discount_type: [
        "percentage",
        "fixed_amount",
        "fixed_price",
        "none",
      ],
      report_status: ["pending", "under_review", "resolved", "dismissed"],
      report_target_type: ["product", "review", "technical_issue", "general"],
    },
  },
} as const
