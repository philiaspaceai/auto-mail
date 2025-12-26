
export interface Attachment {
  name: string;
  data: string; // Base64
  mimeType: string;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  attachments: Attachment[];
}

export interface Recipient {
  id: string;
  company: string;
  email: string;
}

export interface Batch {
  id: string;
  name: string;
  recipients: Recipient[];
}

export interface AppSettings {
  clientId: string;
  accessToken: string;
  tokenExpiry: number;
}

export interface SendStatus {
  recipientId: string;
  status: 'pending' | 'sending' | 'success' | 'error';
  error?: string;
}
