/**
 * Name of the API whose permissions you want to request
 */
export type PERMISSION_NAMES =
  | PermissionName
  | 'background-sync'
  | 'compute-pressure'
  | 'geolocation'
  | 'local-fonts'
  | 'microphone'
  | 'camera'
  | 'notifications'
  | 'payment-handler'
  | 'push'
  | 'screen-wake-lock'
  | 'accelerometer'
  | 'gyroscope'
  | 'magnetometer'
  | 'ambient-light-sensor'
  | 'storage-access'
  | 'top-level-storage-access'
  | 'persistent-storage'
  | 'midi'
  | 'window-management'
  | 'accessibility-events'
  | 'bluetooth'
  | 'clipboard-read'
  | 'clipboard-write'

/**
 * An object that sets options for the permission request.
 * The available options for this object depend on the permission type.
 */
export type PermissionOption =
  | {
      /**
       * Name of the API whose permissions you want to request.
       */
      name: PERMISSION_NAMES
    }
  | {
      /**
       * Name of the API whose permissions you want to request.
       */
      name: 'midi'
      /**
       * Indicates whether you need and/or receive system exclusive messages.
       * The default is `false`.
       */
      sysex?: boolean
    }
  | {
      /**
       * Name of the API whose permissions you want to request.
       */
      name: 'push'
      /**
       * Indicates whether you want to show a notification for every message
       * or be able to send silent push notifications.
       * The default is `false`.
       */
      userVisibleOnly?: boolean
    }

/**
 * Represents the state when the user or the user agent has given express permission,
 * or requires a prompt to approve the use of a feature.
 */
type PermissionGranted = PermissionStatus & {
  state: 'granted' | 'prompt'
}

/**
 * Represents the state when the permission option is invalid
 * or the permission name is not supported by the user agent.
 */
type PermissionError = {
  state: 'unsupported' | 'invalid'
  message: string
  name: string
}

/**
 * Represents the state when the user or the user agent has denied access
 * to the requested feature.
 */
type PermissionDenied = PermissionStatus & {
  state: 'denied'
}

/**
 * Represents the state and status of a permission request.
 */
type PermissionState = PermissionStatus & {
  message?: string
}

/**
 * A generic response for a permission request.
 * The response can vary based on the permission state.
 */
export type PermissionResponse<
  Status extends 'granted' | 'denied' | 'error' | void = void
> = Status extends 'granted'
  ? PermissionGranted
  : Status extends 'denied'
    ? PermissionDenied
    : Status extends 'error'
      ? PermissionError
      : PermissionState

/**
 * Options for handling permission requests across all permission states:
 * `granted`, `denied`, and `error`.
 */
export type PermissionHandlerOption = {
  /**
   * Called when the requested permission is `granted` or requires a `prompt`
   * for the user to approve. The user may later deny permission access on `prompt`,
   * which will trigger the `denied` handler.
   * @param {PermissionGranted} response - The permission request response.
   * @returns {void}
   */
  granted?: (response: PermissionGranted) => void

  /**
   * Called when the requested permission is `denied` by the user.
   * @param {PermissionDenied} response - The permission request response.
   * @returns {void}
   */
  denied?: (response: PermissionDenied) => void

  /**
   * Called when the `permissionOption` is `invalid` or an `unsupported`
   * permission name is used.
   * @param {PermissionError} response - The permission request response.
   * @returns {void}
   */
  error?: (response: PermissionError) => void
}

/**
 * Permission handler events
 */
export type HandlerEvents = {
  onPermissionChange?: (response: PermissionResponse) => void
  onPermissionGranted?: (response: PermissionResponse<'granted'>) => void
  onPermissionDenied?: (response: PermissionResponse<'denied'>) => void
  onPermissionError?: (error: PermissionResponse<'error'>) => void
}

/**
 * Interface for a permission handler.
 * This interface defines the structure for handling permission requests.
 * @readonly
 */
export interface IPermissionHandler<T = void> {
  /**
   * Executes the permission request.
   * @returns {T} - The result of the permission request.
   */
  (): T

  /**
   * Executes a callback whenever the user or user agent changes the permission status.
   * This is useful for real-time notifications or to display popups to alert the user on the status change.
   * @param callback - The callback function that will be called anytime the permission status changes.
   * @returns {void}
   */
  onPermissionChange?: (
    callback: (response: PermissionResponse) => void
  ) => void

  /**
   * Executes a callback if the permission status is `granted` or `prompt`.
   * You're expected to use the feature you're requesting permission for in the callback.
   * If the status is `granted`, the feature will work; else if the status is `prompt`,
   * the user will be prompted to approve or deny access to the feature.
   * If the user denies access, the `onPermissionDenied` callback will be executed.
   * @param callback - The callback function that will be called when the permission is `granted` or requires a `prompt`.
   * @returns {void}
   */
  onPermissionGranted?: (
    callback: (response: PermissionResponse<'granted'>) => void
  ) => void

  /**
   * Executes a callback if the permission status is `denied` by the user or the user agent.
   * @param callback - The callback function that will be called when the permission is `denied`.
   * @returns {void}
   */
  onPermissionDenied?: (
    callback: (response: PermissionResponse<'denied'>) => void
  ) => void

  /**
   * Executes a callback if the permission request encounters an error,
   * e.g., an `invalid` `permissionOption` or `unsupported` permission name is used.
   * @param callback - The callback function that will be called when the permission request is not successful.
   * @returns {void}
   */
  onPermissionError?: (
    callback: (response: PermissionResponse<'error'>) => void
  ) => void
}

/**
 * Represents the asynchronous response for a permission request.
 */
export type AsyncPermissionResponse =
  | {
      granted: PermissionResponse<'granted'>
      denied: null
    }
  | {
      granted: null
      denied: PermissionResponse<'denied'>
    }

/**
 * Interface for an asynchronous permission handler.
 */
export interface IAsyncPermissionHandler
  extends IPermissionHandler<Promise<AsyncPermissionResponse>> {}
