import type {
  HandlerEvents,
  IAsyncPermissionHandler,
  IPermissionHandler,
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
export class PermissionsAPI {
  static permissionNames = [
    'background-sync',
    'compute-pressure',
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
    'bluetooth',
    'clipboard-read',
    'clipboard-write'
  ] as const

  /**
   * A reference to the Permissions API provided by the browser.
   * @private
   * @static
   * @type {Permissions}
   */
  static #permissions = navigator.permissions

  /**
   * A weak map to manage event listeners for permission handlers.
   * @private
   * @static
   * @type {WeakMap<(IPermissionHandler<void> | IAsyncPermissionHandler), HandlerEvents>}
   */
  static #events = new WeakMap<
    IPermissionHandler | IAsyncPermissionHandler,
    HandlerEvents
  >()

  /**
   * Checks if the Permissions API is supported in the current browser/environment.
   * If throwError is true and the Permissions API is not supported, an error is thrown.
   *
   * @param {boolean} [throwError=false] - If true, throws an error if the Permissions API is not supported.
   * @returns {boolean} - True if the Permissions API is supported, false otherwise.
   * @throws {Error}
   */
  static isSupported(): boolean
  static isSupported(throwError: boolean): boolean
  static isSupported(throwError = false) {
    const supported = !!PermissionsAPI.#permissions
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
   * @returns {Promise<PermissionResponse>} - A promise that resolves to the permission response or an error response.
   *
   * @example
   * PermissionsAPI.getPermission({ name: 'geolocation' })
   *  .then(({ error, permission }) => {
   *    if (error) {
   *      console.error('Error fetching permission status:', reason.message)
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
   * const { error, permission } = await PermissionsAPI.getPermission({ name: 'geolocation' })
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
  static async getPermission(
    option: PermissionOptionBase
  ): Promise<PermissionResponse>
  static async getPermission(
    option: PermissionOptionMidi
  ): Promise<PermissionResponse>
  static async getPermission(
    option: PermissionOptionPush
  ): Promise<PermissionResponse>
  static async getPermission(
    option: PermissionOption
  ): Promise<PermissionResponse> {
    try {
      const _status = await PermissionsAPI.#permissions.query(
        option as PermissionDescriptor
      )

      return { error: null, permission: _status }
    } catch (error) {
      if (error.name === 'TypeError') {
        return {
          error: {
            state: 'unsupported',
            name: error.name,
            message: error.message
          },
          permission: null
        }
      }

      return {
        error: { state: 'invalid', name: error.name, message: error.message },
        permission: null
      }
    }
  }

  /**
   * Retrieves a handler for synchronous permission requests.
   * @private
   * @static
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @param {PermissionHandlerOption} [handlerOption] - Optional handler options for granted/denied/error callbacks.
   * @returns {IPermissionHandler} - A permission handler for synchronous requests.
   */
  static #getHandler(permissionOption: PermissionOptionBase): IPermissionHandler
  static #getHandler(
    permissionOption: PermissionOptionBase,
    handlerOption: PermissionHandlerOption
  ): IPermissionHandler
  static #getHandler(permissionOption: PermissionOptionMidi): IPermissionHandler
  static #getHandler(
    permissionOption: PermissionOptionMidi,
    handlerOption: PermissionHandlerOption
  ): IPermissionHandler
  static #getHandler(permissionOption: PermissionOptionPush): IPermissionHandler
  static #getHandler(
    permissionOption: PermissionOptionPush,
    handlerOption: PermissionHandlerOption
  ): IPermissionHandler
  static #getHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): IPermissionHandler {
    const _handler: IPermissionHandler = () => {
      const _events = PermissionsAPI.#events.get(_handler)

      PermissionsAPI.getPermission(permissionOption).then(
        ({ error, permission }) => {
          if (error) {
            if (_events.onPermissionError) _events.onPermissionError(error)
            if (handlerOption?.error) handlerOption.error(error)
            return
          }

          if (_events.onPermissionChange) {
            permission.onchange = () => {
              if (permission.state === 'denied') {
                if (_events.onPermissionDenied)
                  _events.onPermissionDenied(permission)
              } else {
                if (_events.onPermissionGranted)
                  _events.onPermissionGranted(permission)
              }
              _events.onPermissionChange(permission)
            }
          }

          if (permission.state === 'denied') {
            if (_events.onPermissionDenied)
              _events.onPermissionDenied(permission)
            if (handlerOption?.denied) handlerOption.denied(permission)
          } else {
            if (_events.onPermissionGranted)
              _events.onPermissionGranted(permission)
            if (handlerOption?.granted) handlerOption.granted(permission)
          }
        }
      )
    }
    PermissionsAPI.#events.set(_handler, {})

    return _handler
  }

  /**
   * Creates a permission handler for synchronous permission requests.
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @param {PermissionHandlerOption} [handlerOption] - Optional handler options for granted/denied/error callbacks.
   * @returns {IPermissionHandler} - A permission handler for synchronous requests.
   *
   * @example
   * const notificationHandler = PermissionsAPI.getPermissionHandler(
   *  { name: 'notifications' },
   *  {
   *    granted: (permission) => {
   *      console.log('Permission:', permission.state)
   *    },
   *    denied: (permission) => {
   *      console.log('Permission:', permission.state)
   *    },
   *    error: (error) => {
   *      console.error('Permission error:', error)
   *    }
   *  }
   * )
   *
   * // Initiate the handler by calling the handler function
   * notificationHandler()
   *
   * @example
   * const notificationHandler = PermissionsAPI.getPermissionHandler({
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
   *   console.error('Permission error:', error)
   * })
   *
   * // Initiate the handler by calling the handler function
   * notificationHandler()
   */
  static getPermissionHandler(
    permissionOption: PermissionOptionBase
  ): IPermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionBase,
    handlerOption?: PermissionHandlerOption
  ): IPermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionMidi
  ): IPermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionMidi,
    handlerOption?: PermissionHandlerOption
  ): IPermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionPush
  ): IPermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionPush,
    handlerOption?: PermissionHandlerOption
  ): IPermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): IPermissionHandler {
    const handler: IPermissionHandler = PermissionsAPI.#getHandler(
      permissionOption,
      handlerOption
    )
    handler.onPermissionChange = (callback) => {
      PermissionsAPI.#events.get(handler).onPermissionChange = callback
    }
    handler.onPermissionGranted = (callback) => {
      PermissionsAPI.#events.get(handler).onPermissionGranted = callback
    }
    handler.onPermissionDenied = (callback) => {
      PermissionsAPI.#events.get(handler).onPermissionDenied = callback
    }
    handler.onPermissionError = (callback) => {
      PermissionsAPI.#events.get(handler).onPermissionError = callback
    }

    return Object.freeze(handler)
  }

  /**
   * Retrieves a handler for asynchronous permission requests.
   * @private
   * @static
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @returns {IAsyncPermissionHandler} - A permission handler for asynchronous requests.
   */
  static #getAsyncHandler(
    permissionOption: PermissionOptionBase
  ): IAsyncPermissionHandler
  static #getAsyncHandler(
    permissionOption: PermissionOptionMidi
  ): IAsyncPermissionHandler
  static #getAsyncHandler(
    permissionOption: PermissionOptionPush
  ): IAsyncPermissionHandler
  static #getAsyncHandler(
    permissionOption: PermissionOption
  ): IAsyncPermissionHandler {
    const _handler: IAsyncPermissionHandler =
      async (): Promise<PermissionResponse> => {
        const _events = PermissionsAPI.#events.get(_handler)

        const { error, permission } =
          await PermissionsAPI.getPermission(permissionOption)
        if (error) {
          if (_events.onPermissionError) _events.onPermissionError(error)

          return { error, permission: null }
        }

        if (_events.onPermissionChange) {
          permission.onchange = () => {
            if (permission.state === 'denied' && _events.onPermissionDenied) {
              _events.onPermissionDenied(permission)
            } else if (permission.state !== 'denied' && _events.onPermissionGranted) {
              _events.onPermissionGranted(permission)
            }
            _events.onPermissionChange(permission)
          }
        }

        if (permission.state === 'denied') {
          if (_events.onPermissionDenied) _events.onPermissionDenied(permission)

          return { error: null, permission }
        } else {
          if (_events.onPermissionGranted)
            _events.onPermissionGranted(permission)

          return { error: null, permission }
        }
      }
    PermissionsAPI.#events.set(_handler, {})

    return _handler
  }

  /**
   * Creates a permission handler for asynchronous permission requests.
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @returns {IAsyncPermissionHandler} - A permission handler for asynchronous requests.
   *
   * @example
   * const asyncCameraHandler = PermissionsAPI.getAsyncPermissionHandler({ name: 'camera' })
   * asyncCameraHandler()
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
   * const asyncCameraHandler = PermissionsAPI.getAsyncPermissionHandler({ name: 'camera' })
   * const { error, permission } = await asyncCameraHandler()
   * if (error) {
   *   console.error('Async permission error:', error)
   * } else if (permission.state === 'denied') {
   *   console.log('Permission:', permission.state)
   * } else {
   *   console.log('Permission:', permission.state)
   * }
   */
  static getAsyncPermissionHandler(
    permissionOption: PermissionOptionBase
  ): IAsyncPermissionHandler
  static getAsyncPermissionHandler(
    permissionOption: PermissionOptionMidi
  ): IAsyncPermissionHandler
  static getAsyncPermissionHandler(
    permissionOption: PermissionOptionPush
  ): IAsyncPermissionHandler
  static getAsyncPermissionHandler(
    permissionOption: PermissionOption
  ): IAsyncPermissionHandler {
    const handler: IAsyncPermissionHandler =
      PermissionsAPI.#getAsyncHandler(permissionOption)
    handler.onPermissionChange = function (callback) {
      PermissionsAPI.#events.get(handler).onPermissionChange = callback
    }
    handler.onPermissionGranted = function (callback) {
      PermissionsAPI.#events.get(handler).onPermissionGranted = callback
    }
    handler.onPermissionDenied = function (callback) {
      PermissionsAPI.#events.get(handler).onPermissionDenied = callback
    }
    handler.onPermissionError = function (callback) {
      PermissionsAPI.#events.get(handler).onPermissionError = callback
    }

    return Object.freeze(handler)
  }
}
