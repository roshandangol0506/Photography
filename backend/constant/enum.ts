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
