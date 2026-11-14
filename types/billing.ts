export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanDto {
  id: string;
  name: "FREE" | "PRO";
  price: number;
  aiDailyLimit: number;
  features: PlanFeature[];
}
