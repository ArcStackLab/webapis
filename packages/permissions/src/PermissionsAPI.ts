import type {
  AsyncPermissionResponse,
  HandlerEvents,
  IAsyncPermissionHandler,
  IPermissionHandler,
  PermissionHandlerOption,
  PermissionOption,
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
   * A reference to the Permissions API provided by the browser.
   * @private
   * @static
   * @type {Permissions}
   */
  static #permissions: Permissions = navigator.permissions

  /**
   * A weak map to manage event listeners for permission handlers.
   * @private
   * @static
   * @type {WeakMap<IPermissionHandler<void> | IAsyncPermissionHandler, HandlerEvents>}
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
  static isSupported(throwError: boolean = false): boolean {
    const supported = !!PermissionsAPI.#permissions
    if (!supported && throwError) {
      throw new Error(
        'Permissions API is not supported in this browser/environment.'
      )
    }

    return supported
  }

  /**
   * Retrieves a handler for synchronous permission requests.
   * @private
   * @static
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @param {PermissionHandlerOption} [handlerOption] - Optional handler options for granted/denied/error callbacks.
   * @returns {IPermissionHandler} - A permission handler for synchronous requests.
   */
  static #getHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): IPermissionHandler {
    const _handler: IPermissionHandler = function (): void {
      const _events = PermissionsAPI.#events.get(_handler)

      PermissionsAPI.getPermission(permissionOption)
        .then((_permission) => {
          if (_events.onPermissionChange) {
            _permission.onchange = () => {
              if (_permission.state === 'denied') {
                if (_events.onPermissionDenied)
                  _events.onPermissionDenied(
                    _permission as PermissionResponse<'denied'>
                  )
                if (handlerOption?.denied)
                  handlerOption.denied(
                    _permission as PermissionResponse<'denied'>
                  )
              }
              _events.onPermissionChange(_permission)
            }
          }

          if (_permission.state === 'denied') {
            if (_events.onPermissionDenied)
              _events.onPermissionDenied(
                _permission as PermissionResponse<'denied'>
              )
            if (handlerOption?.denied)
              handlerOption.denied(_permission as PermissionResponse<'denied'>)
          } else {
            if (_events.onPermissionGranted)
              _events.onPermissionGranted(
                _permission as PermissionResponse<'granted'>
              )
            if (handlerOption?.granted)
              handlerOption.granted(
                _permission as PermissionResponse<'granted'>
              )
          }
        })
        .catch((error) => {
          if (_events.onPermissionError)
            _events.onPermissionError(error as PermissionResponse<'error'>)
          if (handlerOption?.error)
            handlerOption.error(error as PermissionResponse<'error'>)
        })
    }
    PermissionsAPI.#events.set(_handler, {})

    return _handler
  }

  /**
   * Retrieves a handler for asynchronous permission requests.
   * @private
   * @static
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @returns {IAsyncPermissionHandler} - A permission handler for asynchronous requests.
   */
  static #getAsyncHandler(
    permissionOption: PermissionOption
  ): IAsyncPermissionHandler {
    const _handler: IAsyncPermissionHandler =
      function (): Promise<AsyncPermissionResponse> {
        return new Promise<AsyncPermissionResponse>((resolve, reject) => {
          const _events = PermissionsAPI.#events.get(_handler)

          PermissionsAPI.getPermission(permissionOption)
            .then((_permission) => {
              if (_events.onPermissionChange) {
                _permission.onchange = () => {
                  if (
                    _permission.state === 'denied' &&
                    _events.onPermissionDenied
                  ) {
                    _events.onPermissionDenied(
                      _permission as PermissionResponse<'denied'>
                    )
                  }
                  _events.onPermissionChange(_permission)
                }
              }

              if (_permission.state === 'denied') {
                if (_events.onPermissionDenied)
                  _events.onPermissionDenied(
                    _permission as PermissionResponse<'denied'>
                  )

                return resolve({
                  granted: null,
                  denied: _permission as PermissionResponse<'denied'>
                })
              } else {
                if (_events.onPermissionGranted)
                  _events.onPermissionGranted(
                    _permission as PermissionResponse<'granted'>
                  )

                return resolve({
                  granted: _permission as PermissionResponse<'granted'>,
                  denied: null
                })
              }
            })
            .catch((error) => {
              if (_events.onPermissionError)
                _events.onPermissionError(error as PermissionResponse<'error'>)

              return reject(error as PermissionResponse<'error'>)
            })
        })
      }
    PermissionsAPI.#events.set(_handler, {})

    return _handler
  }

  /**
   * @async
   * Gets the permission status for any valid permission name provided in the option object.
   * @param {PermissionOption} option - Permission request option.
   * @returns {Promise<PermissionResponse>} - A promise that resolves to the permission response or an error response.
   * @throws {PermissionResponse<'error'>}
   *
   * @example
   * PermissionsAPI.getPermission({ name: 'geolocation' })
   *  .then((permission) => {
   *    if (permission.state === 'denied') {
   *      // can't use geolocation service, notify the user
   *      console.log('permission:', permission.state)
   *      return
   *    }
   *    // you can use the geolocation service here
   *    console.log('permission is granted or will prompt the user for access', permission.state)
   *  })
   *  .catch((reason: PermissionResponse<'error'>) => {
   *    console.error('Error fetching permission status:', reason.message)
   *  })
   *
   * @example
   * try {
   *  const permission = await PermissionsAPI.getPermission({ name: 'geolocation' })
   *  if (permission.state === 'denied') {
   *    // can't use geolocation service, notify the user
   *    console.log('permission:', permission.state)
   *  } else {
   *    // you can use the geolocation service here
   *    console.log('permission is granted or will prompt the user for access', permission.state)
   *  }
   *} catch (error) {
   *  console.error('Error fetching permission status:', error)
   *}
   */
  static async getPermission(
    option: PermissionOption
  ): Promise<PermissionResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const _status = await PermissionsAPI.#permissions.query(option as any)

        return resolve(_status)
      } catch (error: any) {
        if (error.name === 'TypeError') {
          return reject({
            state: 'unsupported',
            name: error.name,
            message: error.message
          })
        }

        return reject({
          state: 'invalid',
          name: error.name,
          message: error.message
        })
      }
    })
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
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): IPermissionHandler {
    const handler: IPermissionHandler = PermissionsAPI.#getHandler(
      permissionOption,
      handlerOption
    )
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

  /**
   * Creates a permission handler for asynchronous permission requests.
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @returns {IAsyncPermissionHandler} - A permission handler for asynchronous requests.
   *
   * @example
   * const asyncCameraHandler = PermissionsAPI.getAsyncPermissionHandler({ name: 'camera' })
   * asyncCameraHandler()
   *   .then(({ granted, denied }) => {
   *     if (granted) {
   *       console.log('Permission:', granted.state)
   *     } else {
   *       console.log('Permission:', denied.state)
   *     }
   *   })
   *   .catch((error) => {
   *     console.error('Async permission error:', error)
   *   })
   *
   * @example
   * const asyncCameraHandler = PermissionsAPI.getAsyncPermissionHandler({ name: 'camera' })
   * try {
   *   const { granted, denied } = await asyncCameraHandler()
   *   if (granted) {
   *     console.log('Permission:', granted.state)
   *   } else {
   *     console.log('Permission:', denied.state)
   *   }
   * } catch (error) {
   *   console.error('Async permission error:', error)
   * }
   */
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
