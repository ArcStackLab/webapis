export type PERMISSION_NAMES =
  | PermissionName
  | "background-sync"
  | "compute-pressure"
  | "geolocation"
  | "local-fonts"
  | "microphone"
  | "camera"
  | "notifications"
  | "payment-handler"
  | "push"
  | "screen-wake-lock"
  | "accelerometer"
  | "gyroscope"
  | "magnetometer"
  | "ambient-light-sensor"
  | "storage-access"
  | "top-level-storage-access"
  | "persistent-storage"
  | "midi"
  | "window-management"
  | "accessibility-events"
  | "bluetooth"
  | "clipboard-read"
  | "clipboard-write";

export type PermissionOption =
  | {
      name: PERMISSION_NAMES;
    }
  | {
      name: "midi";
      sysex?: boolean;
    }
  | {
      name: "push";
      userVisibleOnly?: boolean;
    };

type PermissionGranted = {
  state: "granted" | "prompt";
  status: PermissionStatus;
  message: string;
};

type PermissionError = {
  state: "unsupported" | "invalid";
  message: string;
};

type PermissionDenied = {
  state: "denied";
  status: PermissionStatus;
  message: string;
};

type PermissionState = {
  state: "granted" | "prompt" | "denied";
  status: PermissionStatus;
  message: string;
};

export type PermissionResponse<
  Status extends "granted" | "denied" | "error" | void = void,
> = Status extends "granted"
  ? PermissionGranted
  : Status extends "denied"
    ? PermissionDenied
    : Status extends "error"
      ? PermissionError
      : PermissionState;

export type PermissionHandlerOptions = {
  granted?: (response: PermissionGranted) => void;
  denied?: (response: PermissionDenied) => void;
  error?: (response: PermissionError) => void;
};

export type EventsLogs = {
  [eventId: string]: {
    onPermissionChange?: (response: PermissionResponse) => void;
    onPermissionGranted?: (response: PermissionResponse<"granted">) => void;
    onPermissionDenied?: (response: PermissionResponse<"denied">) => void;
    onPermissionError?: (error: PermissionResponse<"error">) => void;
  };
};

export interface IPermissionHandler<T = void> {
  (): T;
  onPermissionChange?: (
    callback: (response: PermissionResponse) => void,
  ) => void;
  onPermissionGranted?: (
    callback: (response: PermissionResponse<"granted">) => void,
  ) => void;
  onPermissionDenied?: (
    callback: (response: PermissionResponse<"denied">) => void,
  ) => void;
  onPermissionError?: (
    callback: (response: PermissionResponse<"error">) => void,
  ) => void;
  eventId: string;
}

export type AsyncPermissionResponse = {
  granted: PermissionResponse<"granted"> | null;
  denied: PermissionResponse<"denied"> | null;
};

export interface IAsyncPermissionHandler
  extends IPermissionHandler<Promise<AsyncPermissionResponse>> {}
