export interface FestivalConfig {
  id: string; // "diwali_2024" | "holi_2025" | "default"
  is_active: boolean;
  start_date: string;
  end_date: string;
  rollout_percentage: number;
  
  // Visual Identity
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    background: string;
    cardBackground: string;
  };
  
  // Assets (URL to Supabase Storage)
  assets: {
    home_banner: string;
    category_icons: Record<string, string>; // category_slug -> icon_url
    app_icon_overlay?: string;
    font_family: string;
    loading_animation: string;
  };
  
  // Business Logic
  offers: string[]; // offer_ids
  category_highlight: string[];
  home_layout: "festive_grid" | "standard_list";
  particle_effect?: "confetti" | "flower_petals" | "diya_float";
  
  // Copywriting
  headline: string;
  cta_button: string;
}

export const DEFAULT_THEME: FestivalConfig = {
  id: "default",
  is_active: true,
  start_date: new Date().toISOString(),
  end_date: new Date().toISOString(),
  rollout_percentage: 100,
  colors: {
    primary: "#00BFA5", // Default Green
    secondary: "#FFD700",
    accent: "#E65100",
    gradient: "linear-gradient(135deg, #00BFA5, #00897B)",
    background: "#FFFFFF",
    cardBackground: "#F5F5F5",
  },
  assets: {
    home_banner: "/banners/default.webp",
    category_icons: {},
    font_family: "Inter",
    loading_animation: "spinner",
  },
  offers: [],
  category_highlight: [],
  home_layout: "standard_list",
  headline: "Fresh Vegetables Delivered",
  cta_button: "Shop Now",
};
