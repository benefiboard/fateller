// Background Sync API와 Periodic Sync API 타입 정의 확장

interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval: number }): Promise<void>;
  unregister(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  // Background Sync API
  sync: SyncManager;

  // Periodic Sync API
  periodicSync: PeriodicSyncManager;
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string;
}

// Push API 타입
interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  permissionState(options?: PushSubscriptionOptionsInit): Promise<PermissionState>;
  subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
}

interface PushSubscriptionOptionsInit {
  userVisibleOnly?: boolean;
  applicationServerKey?: ArrayBuffer | string;
}

interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  options: PushSubscriptionOptions;
  getKey(name: 'p256dh'): ArrayBuffer | null;
  getKey(name: 'auth'): ArrayBuffer | null;
  toJSON(): any;
  unsubscribe(): Promise<boolean>;
}

interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: ArrayBuffer | null;
}

interface PushEvent extends ExtendableEvent {
  data: PushMessageData;
}

interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): any;
  text(): string;
}

// 서비스 워커 글로벌 속성
interface ServiceWorkerGlobalScope {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  caches: CacheStorage;

  // 이벤트 핸들러
  onsync: ((this: ServiceWorkerGlobalScope, ev: SyncEvent) => any) | null;
  onperiodicsync: ((this: ServiceWorkerGlobalScope, ev: PeriodicSyncEvent) => any) | null;
  onpush: ((this: ServiceWorkerGlobalScope, ev: PushEvent) => any) | null;
  onnotificationclick: ((this: ServiceWorkerGlobalScope, ev: NotificationEvent) => any) | null;

  // 이벤트 추가
  addEventListener(type: 'sync', listener: (event: SyncEvent) => void): void;
  addEventListener(type: 'periodicsync', listener: (event: PeriodicSyncEvent) => void): void;
  addEventListener(type: 'push', listener: (event: PushEvent) => void): void;
  addEventListener(type: 'notificationclick', listener: (event: NotificationEvent) => void): void;
}
