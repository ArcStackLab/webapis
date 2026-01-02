# @arcstack/permissions

## Overview

The `@arcstack/permissions` package provides a consistent and programmatic way to manage API permissions in web applications. It allows developers to check the status of various permissions (like geolocation, notifications, etc.) and handle user interactions regarding these permissions seamlessly.

## Supported Permissions

The following permissions are supported by the `@arcstack/permissions` package:

| Permission Name            | Description                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `background-sync`          | Enables your application to synchronize data in the background, ensuring that updates are made even when the app is not actively in use.                |
| `compute-pressure`         | Provides information about the current compute pressure on the device, allowing applications to optimize performance based on available resources.      |
| `geolocation`              | Grants access to the user's location, enabling features that rely on geographical data, such as mapping and location-based services.                    |
| `local-fonts`              | Allows your application to access and use fonts that are installed locally on the user's device, enhancing the visual presentation of text.             |
| `microphone`               | Grants access to the user's microphone, enabling audio input for applications such as voice recognition and communication tools.                        |
| `camera`                   | Allows your application to access the user's camera, enabling features like video conferencing, photography, and augmented reality experiences.         |
| `notifications`            | Enables your application to send notifications to the user, keeping them informed about important updates and events even when the app is not in focus. |
| `payment-handler`          | Allows your application to handle payment requests, facilitating seamless transactions and interactions with payment systems.                           |
| `push`                     | Grants permission to send push notifications to the user, allowing for timely updates and alerts from your application.                                 |
| `screen-wake-lock`         | Prevents the device's screen from dimming or locking, ensuring that your application remains visible during critical tasks.                             |
| `accelerometer`            | Provides access to the device's accelerometer data, enabling features that respond to changes in orientation and movement.                              |
| `gyroscope`                | Grants access to the device's gyroscope data, allowing applications to detect rotation and orientation changes for enhanced user experiences.           |
| `magnetometer`             | Provides access to the device's magnetometer, enabling applications to determine the direction relative to the Earth's magnetic field.                  |
| `ambient-light-sensor`     | Allows access to the device's ambient light sensor, enabling applications to adjust brightness and improve user comfort based on lighting conditions.   |
| `storage-access`           | Grants access to the storage API, allowing applications to read and write data to the user's device storage.                                            |
| `top-level-storage-access` | Allows applications to access top-level storage, enabling more efficient data management and retrieval.                                                 |
| `persistent-storage`       | Grants access to persistent storage, ensuring that data remains available even after the application is closed.                                         |
| `midi`                     | Allows access to MIDI devices, enabling music applications to interact with musical instruments and controllers.                                        |
| `window-management`        | Grants permission to manage browser windows, allowing applications to create, close, and manipulate windows as needed.                                  |
| `accessibility-events`     | Provides access to accessibility events, enabling applications to respond to changes in user accessibility settings.                                    |
| `bluetooth`                | Grants access to Bluetooth devices, allowing applications to connect and communicate with nearby Bluetooth-enabled devices.                             |
| `clipboard-read`           | Allows your application to read data from the clipboard, enabling features like pasting text and images.                                                |
| `clipboard-write`          | Grants permission to write data to the clipboard, allowing users to copy text and images from your application.                                         |

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
