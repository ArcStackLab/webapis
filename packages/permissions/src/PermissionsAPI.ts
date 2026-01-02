import { PermissionsCore } from './PermissionsCore'
import type {
  AsyncPermissionHandler,
  PermissionHandler,
  PermissionHandlerOption,
  PermissionOption,
  PermissionOptionBase,
  PermissionOptionMidi,
  PermissionOptionPush,
  PermissionResponse
} from './types'

/**
 * The PermissionsAPI provides a consistent programmatic way to query the status of API permissions attributed to the current context.
 * For example, the Permissions API can be used to determine if permission to access a particular API has been granted or denied,
 * or requires specific user permission.
 *
 * @link [MDN Permissions_API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
 * @link [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API#browser_compatibility)
 *
 * @class PermissionsAPI
 */
export class PermissionsAPI extends PermissionsCore {
  /**
   * Permission names of permissions api
   * @public
   * @static
   * @readonly
   */
  static readonly permissionNames = [
    'background-sync',
    'geolocation',
    'local-fonts',
    'microphone',
    'camera',
    'notifications',
    'payment-handler',
    'push',
    'screen-wake-lock',
    'accelerometer',
    'gyroscope',
    'magnetometer',
    'ambient-light-sensor',
    'storage-access',
    'top-level-storage-access',
    'persistent-storage',
    'midi',
    'window-management',
    'accessibility-events',
    'clipboard-read',
    'clipboard-write'
  ] as const

  constructor() {
    super()
  }

  /**
   * A convenient way to get the browser permissions instance
   *
   * @returns {Permissions} `navigator.permissions`
   */
  getNativePermissionsInstance(): Permissions {
    return this.permissions
  }

  /**
   * Checks if the Permissions API is supported in the current browser/environment.
   * If throwError is true and the Permissions API is not supported, an error is thrown.
   *
   * @param {boolean} [throwError=false] - If true, throws an error if the Permissions API is not supported.
   * @returns {boolean} True if the Permissions API is supported, false otherwise.
   * @throws {Error}
   */
  isSupported(): boolean
  isSupported(throwError: boolean): boolean
  isSupported(throwError = false) {
    const supported = !!this.permissions
    if (!supported && throwError) {
      throw new Error(
        'Permissions API is not supported in this browser/environment.'
      )
    }

    return supported
  }

  /**
   * @async
   * Gets the permission status for any valid permission name provided in the option object.
   * @param {PermissionOption} option - Permission request option.
   * @returns {Promise<PermissionResponse>} A promise that resolves to the permission response or an error response.
   *
   * @example
   * const permissions = new PermissionsAPI()
   * permissions.getPermission({ name: 'geolocation' })
   *  .then(({ error, permission }) => {
   *    if (error) {
   *      console.error('Error fetching permission status:', error.message)
   *      return
   *    }
   *    if (permission.state === 'denied') {
   *      // can't use geolocation service, notify the user
   *      console.log('permission:', permission.state)
   *      return
   *    }
   *    // you can use the geolocation service here
   *    console.log('permission is granted or will prompt the user for access', permission.state)
   *  })
   *
   * @example
   * const permissions = new PermissionsAPI()
   * const { error, permission } = await permissions.getPermission({ name: 'geolocation' })
   * if (error) {
   *  console.error('Error fetching permission status:', error.message)
   * } else if (permission.state === 'denied') {
   *   // can't use geolocation service, notify the user
   *   console.log('permission:', permission.state)
   * } else {
   *   // you can use the geolocation service here
   *   console.log('permission is granted or will prompt the user for access', permission.state)
   * }
   */
  async getPermission(option: PermissionOptionBase): Promise<PermissionResponse>
  async getPermission(option: PermissionOptionMidi): Promise<PermissionResponse>
  async getPermission(option: PermissionOptionPush): Promise<PermissionResponse>
  async getPermission(option: PermissionOption): Promise<PermissionResponse> {
    return this.queryPermission(option)
  }

  /**
   * Creates a permission handler for synchronous permission requests.
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @param {PermissionHandlerOption} [handlerOption] - Optional handler options for granted/denied/error callbacks.
   * @returns {PermissionHandler} A permission handler for synchronous requests.
   *
   * @example
   * const permissions = new PermissionsAPI()
   * const notificationHandler = permissions.createHandler(
   *  { name: 'notifications' },
   *  {
   *    granted: (permission) => {
   *      console.log('Permission:', permission.state)
   *    },
   *    denied: (permission) => {
   *      console.log('Permission:', permission.state)
   *    },
   *    error: (error) => {
   *      notificationHandler.close()
   *      console.error('Permission error:', error)
   *    }
   *  }
   * )
   *
   * // Initiate the handler by calling the handler function
   * notificationHandler.getPermission()
   *
   * @example
   * const permissions = new PermissionsAPI()
   * const notificationHandler = permissions.createHandler({
   *   name: 'notifications'
   * })
   *
   * notificationHandler.onPermissionChange((permission) => {
   *   console.log('User change permission:', permission.state)
   * })
   * notificationHandler.onPermissionGranted((permission) => {
   *   console.log('Permission:', permission.state)
   * })
   * notificationHandler.onPermissionDenied((permission) => {
   *   console.log('Permission:', permission.state)
   * })
   * notificationHandler.onPermissionError((error) => {
   *   notificationHandler.close()
   *   console.error('Permission error:', error)
   * })
   *
   * // Initiate the handler by calling the handler function
   * notificationHandler.getPermission()
   */
  createHandler(permissionOption: PermissionOptionBase): PermissionHandler
  createHandler(
    permissionOption: PermissionOptionBase,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler
  createHandler(permissionOption: PermissionOptionMidi): PermissionHandler
  createHandler(
    permissionOption: PermissionOptionMidi,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler
  createHandler(permissionOption: PermissionOptionPush): PermissionHandler
  createHandler(
    permissionOption: PermissionOptionPush,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler
  createHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler {
    const handler: PermissionHandler = this.getHandler(
      permissionOption,
      handlerOption
    )
    handler.onPermissionChange = (callback) => {
      this.events.get(handler).onPermissionChange = callback
    }
    handler.onPermissionGranted = (callback) => {
      this.events.get(handler).onPermissionGranted = callback
    }
    handler.onPermissionDenied = (callback) => {
      this.events.get(handler).onPermissionDenied = callback
    }
    handler.onPermissionError = (callback) => {
      this.events.get(handler).onPermissionError = callback
    }

    return Object.freeze(handler)
  }

  /**
   * Creates a permission handler for asynchronous permission requests.
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @returns {AsyncPermissionHandler} A permission handler for asynchronous requests.
   *
   * @example
   * const permissions = new PermissionsAPI()
   * const asyncCameraHandler = permissions.createAsyncHandler({ name: 'camera' })
   * asyncCameraHandler.getPermission()
   *   .then(({ error, permission }) => {
   *     if (error) {
   *       console.error('Async permission error:', error)
   *       return
   *     }
   *
   *     if (permission.state === 'denied') {
   *       console.log('Permission:', permission.state)
   *     } else {
   *       console.log('Permission:', permission.state)
   *     }
   *   })
   *
   * @example
   * const permissions = new PermissionsAPI()
   * const asyncCameraHandler = permissions.createAsyncHandler({ name: 'camera' })
   * const { error, permission } = await asyncCameraHandler.getPermission()
   * if (error) {
   *   console.error('Async permission error:', error)
   * } else if (permission.state === 'denied') {
   *   console.log('Permission:', permission.state)
   * } else {
   *   console.log('Permission:', permission.state)
   * }
   */
  createAsyncHandler(
    permissionOption: PermissionOptionBase
  ): AsyncPermissionHandler
  createAsyncHandler(
    permissionOption: PermissionOptionMidi
  ): AsyncPermissionHandler
  createAsyncHandler(
    permissionOption: PermissionOptionPush
  ): AsyncPermissionHandler
  createAsyncHandler(
    permissionOption: PermissionOption
  ): AsyncPermissionHandler {
    const handler: AsyncPermissionHandler =
      this.getAsyncHandler(permissionOption)
    handler.onPermissionChange = function (callback) {
      this.events.get(handler).onPermissionChange = callback
    }
    handler.onPermissionGranted = function (callback) {
      this.events.get(handler).onPermissionGranted = callback
    }
    handler.onPermissionDenied = function (callback) {
      this.events.get(handler).onPermissionDenied = callback
    }
    handler.onPermissionError = function (callback) {
      this.events.get(handler).onPermissionError = callback
    }

    return Object.freeze(handler)
  }
}
