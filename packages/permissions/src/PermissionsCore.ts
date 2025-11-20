import type {
  AsyncPermissionHandler,
  HandlerEvents,
  PermissionHandler,
  PermissionHandlerOption,
  PermissionOption,
  PermissionResponse
} from './types'

/**
 * The core integration of the browser permissions
 *
 * @class PermissionsCore
 */
export abstract class PermissionsCore {
  /**
   * A reference to the Permissions API provided by the browser.
   * @protected
   * @readonly
   * @type {Permissions}
   */
  protected readonly permissions: Permissions

  /**
   * A weak map to manage event listeners for permission handlers.
   * @protected
   * @readonly
   * @type {WeakMap<(PermissionHandler<void> | AsyncPermissionHandler), HandlerEvents>}
   */
  protected readonly events: WeakMap<
    PermissionHandler | AsyncPermissionHandler,
    HandlerEvents
  >

  constructor() {
    this.permissions = navigator.permissions
    this.events = new WeakMap<
      PermissionHandler | AsyncPermissionHandler,
      HandlerEvents
    >()
  }

  /**
   * @async
   * Queries permission status for any valid permission name provided in the option object.
   * @param {PermissionOption} option - Permission request option.
   * @returns {Promise<PermissionResponse>} A promise that resolves to the permission response or an error response.
   */
  protected async queryPermission(
    option: PermissionOption
  ): Promise<PermissionResponse> {
    try {
      const _status = await this.permissions.query(
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
   * @protected
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @param {PermissionHandlerOption} [handlerOption] - Optional handler options for granted/denied/error callbacks.
   * @returns {PermissionHandler} A permission handler for synchronous requests.
   */
  protected getHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOption
  ): PermissionHandler {
    let _handler: PermissionHandler = {
      close: () => {
        if (_handler) {
          const _events = this.events.get(_handler)
          if (_events.permission) {
            _events.permission.removeEventListener(
              'change',
              _events.eventListener
            )
          }
          this.events.delete(_handler)
          _handler = null
        }
      },
      getPermission: () => {
        const _events = this.events.get(_handler)

        if (!_events || _handler === null)
          throw new Error('Cannot get permission: handler has been closed')

        this.queryPermission(permissionOption).then(({ error, permission }) => {
          if (error) {
            if (_events.onPermissionError) _events.onPermissionError(error)
            if (handlerOption?.error) handlerOption.error(error)
            return
          }

          if (_events.permission) {
            _events.permission.removeEventListener(
              'change',
              _events.eventListener
            )
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
        })
      }
    }
    this.events.set(_handler, {})

    return _handler
  }

  /**
   * Retrieves a handler for asynchronous permission requests.
   * @protected
   * @param {PermissionOption} permissionOption - The permission option to request.
   * @returns {AsyncPermissionHandler} A permission handler for asynchronous requests.
   */
  protected getAsyncHandler(
    permissionOption: PermissionOption
  ): AsyncPermissionHandler {
    let _handler: AsyncPermissionHandler = {
      close: () => {
        if (_handler) {
          const _events = this.events.get(_handler)
          if (_events.permission) {
            _events.permission.removeEventListener(
              'change',
              _events.eventListener
            )
          }
          this.events.delete(_handler)
          _handler = null
        }
      },
      getPermission: async (): Promise<PermissionResponse> => {
        const _events = this.events.get(_handler)

        const { error, permission } =
          await this.queryPermission(permissionOption)
        if (error) {
          if (_events.onPermissionError) _events.onPermissionError(error)

          return { error, permission: null }
        }

        if (_events.permission) {
          _events.permission.removeEventListener(
            'change',
            _events.eventListener
          )
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
    this.events.set(_handler, {})

    return _handler
  }
}
