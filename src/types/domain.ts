export type UserRole =
  | "client"
  | "therapist"
  | "salon_admin"
  | "nutritionist"
  | "super_admin";

export type UserStatus = "active" | "invited" | "suspended" | "withdrawn";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type PhotoType = "before" | "after" | "reference";

export type FeedbackStatus =
  | "ai_drafting"
  | "awaiting_review"
  | "approved"
  | "rejected"
  | "sent";

export type BillingMode = "B2B_ONLY" | "B2C_ONLY" | "DUAL";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "unpaid";

export type InviteTargetRole = "client" | "therapist";

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

export const PHOTO_TYPE_LABEL: Record<PhotoType, string> = {
  before: "施術前",
  after: "施術後",
  reference: "参考",
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  requested: "申請中",
  confirmed: "確定",
  completed: "完了",
  cancelled: "キャンセル",
  no_show: "未来店",
};

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  client: "/c/progress",
  therapist: "/t/today",
  salon_admin: "/admin/dashboard",
  nutritionist: "/n/queue",
  super_admin: "/admin/dashboard",
};
