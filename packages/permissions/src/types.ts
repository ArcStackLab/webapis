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

export type PermissionOptionBase = {
  /**
   * Name of the API whose permissions you want to request.
   */
  name: PERMISSION_NAMES
}

export type PermissionOptionMidi = {
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

export type PermissionOptionPush = {
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
 * An object that sets options for the permission request.
 * The available options for this object depend on the permission type.
 */
export type PermissionOption = PermissionOptionBase | PermissionOptionMidi | PermissionOptionPush

/**
 * Represents the state when the user or the user agent has given express permission,
 * or requires a prompt to approve the use of a feature.
 */
export type PermissionGranted = PermissionStatus & {
  state: 'granted' | 'prompt'
}

/**
 * Represents the state when the permission option is invalid
 * or the permission name is not supported by the user agent.
 */
export type PermissionError = {
  state: 'unsupported' | 'invalid'
  message: string
  name: string
}

/**
 * Represents the state when the user or the user agent has denied access
 * to the requested feature.
 */
export type PermissionDenied = PermissionStatus & {
  state: 'denied'
}

/**
 * A generic response for a permission request.
 * The response can vary based on the permission state.
 */
export type PermissionResponse =
  | { error: PermissionError, permission: null }
  | { error: null, permission: PermissionGranted | PermissionDenied }

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
  onPermissionChange?: (response: PermissionGranted | PermissionDenied) => void
  onPermissionGranted?: (response: PermissionGranted) => void
  onPermissionDenied?: (response: PermissionDenied) => void
  onPermissionError?: (error: PermissionError) => void
  eventListener?: () => void
  permission?: PermissionGranted | PermissionDenied
}

/**
 * Interface for a permission handler.
 * This interface defines the structure for handling permission requests.
 * @readonly
 */
export type PermissionHandler<T = void> = {
  /**
   * Executes the permission request.
   * @returns {T} - The result of the permission request.
   * @throws {Error} - Throws if handler is already closed
   */
  getPermission: () => T

  /**
   * Remove event listener and garage collect the permission handler
   * The permission object will become null after calling close on the handler
   */
  close: () => void

  /**
   * Executes a callback whenever the user or user agent changes the permission status.
   * This is useful for real-time notifications or to display popups to alert the user on the status change.
   * @param callback - The callback function that will be called anytime the permission status changes.
   * @returns {void}
   */
  onPermissionChange?: (callback: (permission: PermissionGranted | PermissionDenied) => void) => void

  /**
   * Executes a callback if the permission status is `granted` or `prompt`.
   * You're expected to use the feature you're requesting permission for in the callback.
   * If the status is `granted`, the feature will work; else if the status is `prompt`,
   * the user will be prompted to approve or deny access to the feature.
   * If the user denies access, the `onPermissionDenied` callback will be executed.
   * @param callback - The callback function that will be called when the permission is `granted` or requires a `prompt`.
   * @returns {void}
   */
  onPermissionGranted?: (callback: (permission: PermissionGranted) => void) => void

  /**
   * Executes a callback if the permission status is `denied` by the user or the user agent.
   * @param callback - The callback function that will be called when the permission is `denied`.
   * @returns {void}
   */
  onPermissionDenied?: (callback: (permission: PermissionDenied) => void) => void

  /**
   * Executes a callback if the permission request encounters an error,
   * e.g., an `invalid` `permissionOption` or `unsupported` permission name is used.
   * @param callback - The callback function that will be called when the permission request is not successful.
   * @returns {void}
   */
  onPermissionError?: (callback: (error: PermissionError) => void) => void
}

/**
 * Interface for an asynchronous permission handler.
 */
export type AsyncPermissionHandler = PermissionHandler<Promise<PermissionResponse>>
