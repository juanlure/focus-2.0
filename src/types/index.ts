export interface ActionCapsule {
  id: string;
  title: string;
  summary: string;
  actions: string[];
  priority: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  source: string;
  sourceType: 'whatsapp' | 'email' | 'twitter' | 'pdf' | 'youtube' | 'article' | 'other';
  createdAt: Date;
  readTime: number;
  tags: string[];
}

export interface UserStats {
  totalCapsules: number;
  savedHours: number;
  processedThisWeek: number;
  averageProcessTime: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  cta: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  details: string[];
}
