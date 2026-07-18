export enum ACTION {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VIEW = "VIEW",
}

export enum Environment {
  DEVELOPMENT = "DEVELOPMENT",
  PRODUCTION = "PRODUCTION",
}

export enum ROLE {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum AgentEvents {
  userReqExpired = "userReqExpired",
  agentReqExpired = "agentReqExpired",
  agentReject = "agentReject",
  userReject = "userReject",
}

export enum VISIBILITY {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVE = "archive",
}

export enum COMMENT_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum MESSAGE_STATUS {
  NEW = "new",
  READ = "read",
  ARCHIVED = "archived",
}

export enum ANALYTICS_RANGE {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum STORAGE_PROVIDER {
  LOCAL = "LOCAL",
  S3 = "S3",
}
