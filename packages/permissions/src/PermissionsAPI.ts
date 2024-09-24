import type {
  AsyncPermissionResponse,
  EventsLogs,
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
   * An object to store the current state of permissions.
   * @private
   * @static
   * @type {Object<string, PermissionResponse>}
   */
  static #permissionStates: {
    [key: string]: PermissionResponse
  } = {}

  /**
   * An object to manage event listeners for permission changes.
   * @private
   * @static
   * @type {EventsLogs}
   */
  static #events: EventsLogs = {}

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
      const _events = PermissionsAPI.#events[_handler.eventId]

      PermissionsAPI.getPermission(permissionOption)
        .then((_permission) => {
          if (_events.onPermissionChange) {
            _permission.status.onchange = function () {
              _events.onPermissionChange({
                name: this.name,
                status: this,
                state: this.state
              })
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
    _handler.eventId = crypto.randomUUID()
    PermissionsAPI.#events[_handler.eventId] = {}

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
          const _events = PermissionsAPI.#events[_handler.eventId]

          PermissionsAPI.getPermission(permissionOption)
            .then((_permission) => {
              if (_events.onPermissionChange) {
                _permission.status.onchange = function () {
                  _events.onPermissionChange({
                    name: this.name,
                    status: this,
                    state: this.state
                  })
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
    _handler.eventId = crypto.randomUUID()
    PermissionsAPI.#events[_handler.eventId] = {}

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
   *      console.log('permission denied:', permission)
   *      return
   *    }
   *    // you can use the geolocation service here
   *    console.log('permission is granted or will prompt the user for access', permission)
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
   *    console.log('permission denied:', permission)
   *  } else {
   *    // you can use the geolocation service here
   *    console.log('permission is granted or will prompt the user for access', permission)
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
        const permissionStatus = {
          state: _status.state,
          status: _status,
          name: _status.name
        }
        permissionStatus.status.addEventListener('change', function () {
          PermissionsAPI.#permissionStates[option.name].state = this.state
        })
        PermissionsAPI.#permissionStates[option.name] = permissionStatus

        return resolve(PermissionsAPI.#permissionStates[option.name])
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
   *      console.log('Permission granted:', permission)
   *    },
   *    denied: (permission) => {
   *      console.log('Permission denied:', permission)
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
   *   console.log('User change permission:', permission)
   * })
   * notificationHandler.onPermissionGranted((permission) => {
   *   console.log('Permission granted:', permission)
   * })
   * notificationHandler.onPermissionDenied((permission) => {
   *   console.log('Permission denied:', permission)
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
      PermissionsAPI.#events[handler.eventId].onPermissionChange = callback
    }
    handler.onPermissionGranted = function (callback) {
      PermissionsAPI.#events[handler.eventId].onPermissionGranted = callback
    }
    handler.onPermissionDenied = function (callback) {
      PermissionsAPI.#events[handler.eventId].onPermissionDenied = callback
    }
    handler.onPermissionError = function (callback) {
      PermissionsAPI.#events[handler.eventId].onPermissionError = callback
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
   *       console.log('Permission granted:', granted)
   *     } else {
   *       console.log('Permission denied:', denied)
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
   *     console.log('Permission granted:', granted)
   *   } else {
   *     console.log('Permission denied:', denied)
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
      PermissionsAPI.#events[handler.eventId].onPermissionChange = callback
    }
    handler.onPermissionGranted = function (callback) {
      PermissionsAPI.#events[handler.eventId].onPermissionGranted = callback
    }
    handler.onPermissionDenied = function (callback) {
      PermissionsAPI.#events[handler.eventId].onPermissionDenied = callback
    }
    handler.onPermissionError = function (callback) {
      PermissionsAPI.#events[handler.eventId].onPermissionError = callback
    }

    return Object.freeze(handler)
  }
}
