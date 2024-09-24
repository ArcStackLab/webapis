# @arcstack/permissions

## Overview

The `@arcstack/permissions` package provides a consistent and programmatic way to manage API permissions in web applications. It allows developers to check the status of various permissions (like geolocation, notifications, etc.) and handle user interactions regarding these permissions seamlessly.

## Table of Contents

- [@arcstack/permissions](#arcstackpermissions)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Importing the API](#importing-the-api)
    - [Getting Permission Status](#getting-permission-status)
    - [Creating Permission Handlers](#creating-permission-handlers)
      - [Synchronous Permission Handler](#synchronous-permission-handler)
      - [Asynchronous Permission Handler](#asynchronous-permission-handler)
  - [API Reference](#api-reference)
    - [PermissionsAPI Class](#permissionsapi-class)
      - [Methods](#methods)
    - [Permission Types](#permission-types)
  - [Examples](#examples)
    - [Example 1: Checking Geolocation Permission](#example-1-checking-geolocation-permission)
    - [Example 2: Using Notification Permission Handler](#example-2-using-notification-permission-handler)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

To install the package, use npm or yarn:

```bash
npm install @arcstack/permissions
```

or

```bash
yarn add @arcstack/permissions
```

## Usage

### Importing the API

You can import the `PermissionsAPI` from the package as follows:

```typescript
import { PermissionsAPI } from '@arcstack/permissions'
```

### Getting Permission Status

To get the permission status for a specific API, use the `getPermission` method:

```typescript
async function checkGeolocationPermission() {
  try {
    const permission = await PermissionsAPI.getPermission({
      name: 'geolocation'
    })
    console.log('Permission state:', permission.state)
  } catch (error) {
    console.error('Error fetching permission status:', error)
  }
}
```

### Creating Permission Handlers

You can create permission handlers for synchronous and asynchronous requests using the `getPermissionHandler` and `getAsyncPermissionHandler` methods, respectively.

#### Synchronous Permission Handler

```typescript
const notificationHandler = PermissionsAPI.getPermissionHandler(
  { name: 'notifications' },
  {
    granted: (permission) => {
      console.log('Permission granted:', permission)
    },
    denied: (permission) => {
      console.log('Permission denied:', permission)
    },
    error: (error) => {
      console.error('Permission error:', error)
    }
  }
)
// Initiate the handler by calling the handler function
notificationHandler()
```

#### Asynchronous Permission Handler

```typescript
const asyncCameraHandler = PermissionsAPI.getAsyncPermissionHandler({
  name: 'camera'
})
asyncCameraHandler()
  .then(({ granted, denied }) => {
    if (granted) {
      console.log('Permission granted:', granted)
    } else {
      console.log('Permission denied:', denied)
    }
  })
  .catch((error) => {
    console.error('Async permission error:', error)
  })
```

## API Reference

### PermissionsAPI Class

The `PermissionsAPI` class provides methods to manage permissions.

#### Methods

- **`static async getPermission(option: PermissionOption): Promise<PermissionResponse>`**

  - Gets the permission status for any valid permission name provided in the option object.

- **`static getPermissionHandler(permissionOption: PermissionOption, handlerOption?: PermissionHandlerOption): IPermissionHandler`**

  - Creates a permission handler for synchronous permission requests.

- **`static getAsyncPermissionHandler(permissionOption: PermissionOption): IAsyncPermissionHandler`**
  - Creates a permission handler for asynchronous permission requests.

### Permission Types

The following types are used in the API:

- **`PermissionOption`**: Defines the options for requesting permissions.
- **`PermissionResponse`**: Represents the response for a permission request, which can vary based on the permission state.
- **`PermissionHandlerOption`**: Options for handling permission requests across all permission states.

## Examples

### Example 1: Checking Geolocation Permission

```typescript
async function checkGeolocationPermission() {
  try {
    const permission = await PermissionsAPI.getPermission({
      name: 'geolocation'
    })
    if (permission.state === 'denied') {
      console.log('Geolocation permission denied.')
    } else {
      console.log(
        'Geolocation permission granted or will prompt the user for access.'
      )
    }
  } catch (error) {
    console.error('Error fetching permission status:', error)
  }
}
```

### Example 2: Using Notification Permission Handler

```typescript
const notificationHandler = PermissionsAPI.getPermissionHandler(
  { name: 'notifications' },
  {
    granted: (permission) => {
      console.log('Notification permission granted:', permission)
    },
    denied: (permission) => {
      console.log('Notification permission denied:', permission)
    },
    error: (error) => {
      console.error('Notification permission error:', error)
    }
  }
)
// Initiate the handler
notificationHandler()
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
