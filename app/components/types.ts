type Webhook = {
  ID: number;
  EventName: string;
  TargetUrl: string;
  Status: string; // "active", "paused", "disabled"
};

type APIResponse<T = unknown> = {
  success: boolean;
  data: T;
};

type WebhooksResponse = APIResponse<Webhook[]>;
