import type {
  AsyncPermissionHandler,
  HandlerEvents,
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
export class PermissionsAPI {
  /**
   * Permission names of permissions api
   * @public
   * @static
   */
  static permissionNames = [
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
   * @type {WeakMap<(PermissionHandler<void> | AsyncPermissionHandler), HandlerEvents>}
   */
  static #events = new WeakMap<
    PermissionHandler | AsyncPermissionHandler,
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
   * @returns {PermissionHandler} - A permission handler for synchronous requests.
   */
  static #getHandler(permissionOption: PermissionOptionBase): PermissionHandler
  static #getHandler(
    permissionOption: PermissionOptionBase,
    handlerOption: PermissionHandlerOption
  ): PermissionHandler
  static #getHandler(permissionOption: PermissionOptionMidi): PermissionHandler
  static #getHandler(
    permissionOption: PermissionOptionMidi,
    handlerOption: PermissionHandlerOption
  ): PermissionHandler
  static #getHandler(permissionOption: PermissionOptionPush): PermissionHandler
  static #getHandler(
    permissionOption: PermissionOptionPush,
    handlerOption: PermissionHandlerOption
  ): PermissionHandler
  static #getHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler {
    let _handler: PermissionHandler = {
      close: () => {
        if (_handler) {
          const _events = PermissionsAPI.#events.get(_handler)
          if (_events.permission) {
            _events.permission.removeEventListener('change', _events.eventListener)
          }
          PermissionsAPI.#events.delete(_handler)
          _handler = null
        }
      },
      getPermission: () => {
        const _events = PermissionsAPI.#events.get(_handler)

        if (!_events || _handler === null) throw new Error('Cannot get permission: handler has been closed')

        PermissionsAPI.getPermission(permissionOption).then(
          ({ error, permission }) => {
            if (error) {
              if (_events.onPermissionError) _events.onPermissionError(error)
              if (handlerOption?.error) handlerOption.error(error)
              return
            }

            if (_events.permission) {
              _events.permission.removeEventListener('change', _events.eventListener)
            }

            _events.permission = permission
            _events.eventListener = () => {
              if (permission.state === 'denied') {
                if (_events.onPermissionDenied)
                  _events.onPermissionDenied(permission)
              } else {
                if (_events.onPermissionGranted)
                  _events.onPermissionGranted(permission)
              }
              if (_events.onPermissionChange) {
                _events.onPermissionChange(permission)
              }
            }

            permission.addEventListener('change', _events.eventListener)

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
    }
    PermissionsAPI.#events.set(_handler, {})

    return _handler
  }

  /**
   * Creates a permission handler for synchronous permission requests.
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @param {PermissionHandlerOption} [handlerOption] - Optional handler options for granted/denied/error callbacks.
   * @returns {PermissionHandler} - A permission handler for synchronous requests.
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
   *   notificationHandler.close()
   *   console.error('Permission error:', error)
   * })
   *
   * // Initiate the handler by calling the handler function
   * notificationHandler.getPermission()
   */
  static getPermissionHandler(
    permissionOption: PermissionOptionBase
  ): PermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionBase,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionMidi
  ): PermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionMidi,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionPush
  ): PermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOptionPush,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler
  static getPermissionHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler {
    const handler: PermissionHandler = PermissionsAPI.#getHandler(
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
   * @returns {AsyncPermissionHandler} - A permission handler for asynchronous requests.
   */
  static #getAsyncHandler(
    permissionOption: PermissionOptionBase
  ): AsyncPermissionHandler
  static #getAsyncHandler(
    permissionOption: PermissionOptionMidi
  ): AsyncPermissionHandler
  static #getAsyncHandler(
    permissionOption: PermissionOptionPush
  ): AsyncPermissionHandler
  static #getAsyncHandler(
    permissionOption: PermissionOption
  ): AsyncPermissionHandler {
    let _handler: AsyncPermissionHandler = {
      close: () => {
        if (_handler) {
          const _events = PermissionsAPI.#events.get(_handler)
          if (_events.permission) {
            _events.permission.removeEventListener('change', _events.eventListener)
          }
          PermissionsAPI.#events.delete(_handler)
          _handler = null
        }
      },
      getPermission: async (): Promise<PermissionResponse> => {
        const _events = PermissionsAPI.#events.get(_handler)

        const { error, permission } =
          await PermissionsAPI.getPermission(permissionOption)
        if (error) {
          if (_events.onPermissionError) _events.onPermissionError(error)

          return { error, permission: null }
        }

        if (_events.permission) {
          _events.permission.removeEventListener('change', _events.eventListener)
        }

        _events.permission = permission
        _events.eventListener = () => {
          if (permission.state === 'denied') {
            if (_events.onPermissionDenied)
              _events.onPermissionDenied(permission)
          } else {
            if (_events.onPermissionGranted)
              _events.onPermissionGranted(permission)
          }
          if (_events.onPermissionChange) {
            _events.onPermissionChange(permission)
          }
        }

        permission.addEventListener('change', _events.eventListener)

        if (permission.state === 'denied') {
          if (_events.onPermissionDenied) _events.onPermissionDenied(permission)

          return { error: null, permission }
        } else {
          if (_events.onPermissionGranted)
            _events.onPermissionGranted(permission)

          return { error: null, permission }
        }
      }
    }
    PermissionsAPI.#events.set(_handler, {})

    return _handler
  }

  /**
   * Creates a permission handler for asynchronous permission requests.
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @returns {AsyncPermissionHandler} - A permission handler for asynchronous requests.
   *
   * @example
   * const asyncCameraHandler = PermissionsAPI.getAsyncPermissionHandler({ name: 'camera' })
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
   * const asyncCameraHandler = PermissionsAPI.getAsyncPermissionHandler({ name: 'camera' })
   * const { error, permission } = await asyncCameraHandler.getPermission()
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
  ): AsyncPermissionHandler
  static getAsyncPermissionHandler(
    permissionOption: PermissionOptionMidi
  ): AsyncPermissionHandler
  static getAsyncPermissionHandler(
    permissionOption: PermissionOptionPush
  ): AsyncPermissionHandler
  static getAsyncPermissionHandler(
    permissionOption: PermissionOption
  ): AsyncPermissionHandler {
    const handler: AsyncPermissionHandler =
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
