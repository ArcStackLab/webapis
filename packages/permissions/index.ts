/**
 * `@arcstack/permissions` This Permissions API provides a consistent programmatic way to request the status of API permissions attributed to the current context.
 *
 * @module PermissionsAPI
 */
export { PermissionsAPI } from './src/PermissionsAPI'
export type {
  PERMISSION_NAMES,
  PermissionOption,
  PermissionResponse,
  PermissionHandlerOption,
  IPermissionHandler,
  AsyncPermissionResponse,
  IAsyncPermissionHandler
} from './src/types'
