export interface UserData {
  id?: string;
  role: "User" | "Agent";
  category?: string;
  source: string;
  engagedWith?: string;
  requester?: string;
  waiting?: boolean;
  status?: "active" | "passive";
  name?: string;
  location?: string;
  navigationHistory?: Record<string, string>;
  sessionHistory?: Record<string, string>;
  joined?: boolean;
  connected?: boolean | number;
  AgentDetails?: AgentDetails;
  UserConnectedDetails?: UserConnectedDetails;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_pic?: string;
  mobileNumber?: string;
  phone?: string;
  mobile?: string;
  phoneNumber?: string;
  origin?: string;
  username?: string;
  latitude?: string;
  longitude?: string;
  osInfo?: string;
  broswerInfo?: string;
  updatedDate?: string;
  init_req: string;
  acceptedIndiv?: string[] | undefined;
  rejectedIndiv?: string[] | undefined;
  rejectedAgents?: string[] | undefined;
  requestedTransferTo?: string[] | undefined;
}

export interface clientDetails {
  name?: string;
  email?: string;
  mobile?: string;
  profile_pic?: string;
}

export interface jsonDataDetails {
  name?: string;
  email?: string;
  mobile?: string;
  profile_pic?: string;
}

export interface AgentDetails {
  org_id?: string;
  branch_id?: string[];
  region_id?: string;
}

export interface UserConnectedDetails {
  org_id?: string;
  branch_id?: string;
  region_id?: string;
}

export interface ServerMetadata {
  time: number;
  sender: string;
  source: string | null;
  receipent: string;
}

export interface Message {
  type: string;
  text: { text: string } | string;
  payload?: string;
  attachment?: {
    payload?: string;
    type?: string;
  };
  id?: string;
}

export interface AttachmentPayload {
  payload: {
    path?: string;
    mediaId?: string;
  };
  type: string;
}

export interface SessionEvent {
  event: string;
  data: string;
  engagedWith?: string;
  timestamp: number;
}

export interface Session {
  agent: string;
  visitor?: string;
  organizationId: string | undefined;
  source?: string;
  events: SessionEvent[];
  createdDate?: number;
}

export interface UserDetails {
  name?: string;
  phone?: string;
  mobile?: string;
  phoneNumber?: string;
  agentId?: string;
  email?: string;
  subject?: string;
  to_email?: string;
  connected?: boolean;
}

export interface Details {
  branch_id?: string;
  branchSelected?: string;
  gdpr?: string;
  org_id?: string;
  region_id?: string;
  openai_url?: string;
  header_Name?: string;
  client_Name?: string;
}

export interface ProfileDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_pic?: string;
  mobile?: string;
  name?: string;

  category?: string;
  role?: "User" | "Agent";
  source?: string;
  joined?: boolean;
  connected?: boolean;

  UserConnectedDetails?: {
    org_id: string;
    branch_id: string | number;
    region_id?: string | null;
  };

  sessionHistory?: Record<string, string>;
}

export interface ClientDetails {
  name: string;
  email: string;
  mobile: string;
}

export interface VisitorAgent {
  userId: string;
  name?: string;
  email?: string;
  mobile?: string;
  category?: string;
  role?: "User" | "Agent";
  source?: string;
  connected?: boolean | number;
  navigationHistory?: Record<string, string>;
  sessionHistory?: Record<string, string>;
  location?: string | null;
  latitude?: number | string;
  longitude?: number | string;
  osInfo?: string;
  status?: "active" | "inactive" | "passive";
  AgentDetails?: AgentDetails;
  joined?: boolean;
  clientDetails?: ClientDetails;
  UserConnectedDetails?: UserConnectedDetails;
}

export interface NoOneAvaialbleMessage {
  text?: string;
  responseMessage?: { message?: string; custom?: string };
  custom?: string;
  message?: string;
  id?: string;
}

export type broadcastToAgentsData = [
  (
    | Message
    | MessageSentPayload
    | { source?: string | null; userId?: string | null }
    | undefined
  ),
  MessageSentPayload | ServerMetadata | undefined,
  string | undefined,
];

export interface MessageSentPayload {
  type?: string;
  text?: string;
  title?: string;
  payload?: string;
  data_type?: string;
  attachment?: any;
  guided?: string | null;
  isLink?: boolean;
  formMessageSection?: boolean;
  bot?: boolean;
  human?: boolean;
  isOfflineMessage?: boolean;
  targetSource?: string;
  targetCategory?: string;
  messageFor?: string;
  messageId?: string;
  query_offline?: boolean;
  id?: string;
}

export interface MessageSentMetadata {
  receipent?: string;
  sender?: string;
  source?: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  branch_id?: string;
  branch?: string;
  organization_id?: string;
  time?: number;
  guided?: string | null;
  messageFor?: string;
  messageId?: string;
  payload?: string;
  branchSelected?: string;
  gdpr?: string;
  org_id?: string;
  region_id?: string;
  openai_url?: string;
  agentId?: string;
  livechat_end?: boolean;
  header_Name?: string;
}
