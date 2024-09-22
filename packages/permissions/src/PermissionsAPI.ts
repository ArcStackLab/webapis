import type {
  AsyncPermissionResponse,
  EventsLogs,
  IAsyncPermissionHandler,
  IPermissionHandler,
  PermissionHandlerOptions,
  PermissionOption,
  PermissionResponse
} from './types'

/**
 * The PermissionsAPI provides a consistent programmatic way to query the status of API permissions attributed to the current context. For example, the Permissions API can be used to determine if permission to access a particular API has been granted or denied, or requires specific user permission.
 *
 * @link [MDN Permissions_API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
 * @link [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API#browser_compatibility)
 *
 * @class PermissionsAPI
 */
export class PermissionsAPI {
  static #permissions: Permissions = navigator.permissions

  static #permissionStates: {
    [key: string]: PermissionResponse
  } = {}

  static #events: EventsLogs = {}

  static #getHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOptions
  ): IPermissionHandler {
    const _handler: IPermissionHandler = function (): void {
      PermissionsAPI.getPermission(permissionOption).then((_permission) => {
        const _events = PermissionsAPI.#events[_handler.eventId]
        if ('status' in _permission) {
          if (_events.onPermissionChange) {
            const onChange = _events.onPermissionChange
            _permission.status.onchange = function () {
              onChange({
                message: this.name,
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
        } else {
          if (_events.onPermissionError)
            _events.onPermissionError(
              _permission as PermissionResponse<'error'>
            )
          if (handlerOption?.error)
            handlerOption.error(_permission as PermissionResponse<'error'>)
        }
      })
    }
    _handler.eventId = crypto.randomUUID()
    PermissionsAPI.#events[_handler.eventId] = {}

    return _handler
  }

  static #getAsyncHandler(
    permissionOption: PermissionOption
  ): IAsyncPermissionHandler {
    const _handler: IAsyncPermissionHandler =
      async function (): Promise<AsyncPermissionResponse> {
        const _permission = await PermissionsAPI.getPermission(permissionOption)
        const _events = PermissionsAPI.#events[_handler.eventId]

        return new Promise<AsyncPermissionResponse>((resolve, reject) => {
          if ('status' in _permission) {
            if (_events.onPermissionChange) {
              const onChange = _events.onPermissionChange
              _permission.status.onchange = function () {
                onChange({
                  message: this.name,
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
          } else {
            if (_events.onPermissionError)
              _events.onPermissionError(
                _permission as PermissionResponse<'error'>
              )

            return reject(_permission as PermissionResponse<'error'>)
          }
        })
      }
    _handler.eventId = crypto.randomUUID()
    PermissionsAPI.#events[_handler.eventId] = {}

    return _handler
  }

  static async getPermission(
    option: PermissionOption
  ): Promise<PermissionResponse | PermissionResponse<'error'>> {
    try {
      const _status = await PermissionsAPI.#permissions.query(option as any)
      const permissionStatus = {
        state: _status.state,
        status: _status,
        message: _status.name
      }
      permissionStatus.status.addEventListener('change', function () {
        PermissionsAPI.#permissionStates[option.name].state = this.state
      })
      PermissionsAPI.#permissionStates[option.name] = permissionStatus

      return PermissionsAPI.#permissionStates[option.name]
    } catch (error: any) {
      if (error.name === 'TypeError') {
        return {
          state: 'unsupported',
          message: error.message
        }
      }

      return {
        state: 'invalid',
        message: error.message
      }
    }
  }

  static getPermissionHandler(
    permissionOption: PermissionOption,
    handlerOption?: PermissionHandlerOptions
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

    return handler
  }

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

    return handler
  }
}
