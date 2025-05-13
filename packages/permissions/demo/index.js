import { PermissionsAPI } from '../dist/permissions.js'

const { isSupported, permissionNames, getPermissionHandler } = PermissionsAPI

function createCodeTag(text, color = '#e3e3e3') {
  const code = document.createElement('code')
  code.textContent = text
  code.style = `background-color: ${color}; padding: 0.5em 1em; border-radius: 5px; margin: 0.2em; display: inline-block`

  return code
}

function createOptionTag(value) {
  const option = document.createElement('option')
  option.value = value
  option.textContent = value

  return option
}

/**
 * @type {ReturnType<PermissionsAPI.getPermissionHandler>}
 */
let permissionHandler
const closeButton = document.querySelector('#close')

const closeHandler = () => {
  if (permissionHandler) {
    permissionHandler.close()
  }
  closeButton.replaceChildren(createCloseButton('', true))
}

function createCloseButton(name, disabled = false) {
  const button = document.createElement('button')
  button.textContent = `Close ${name} Permission Handler`
  button.disabled = disabled
  button.onclick = closeHandler

  return button
}

const stateColor = {
  granted: 'lightgreen',
  prompt: 'lightblue',
  unsupported: 'lightcoral',
  invalid: 'lightcoral',
  denied: 'lightcoral'
}

function handlePermission(option) {
  permissionHandler = PermissionsAPI.getPermissionHandler(option, {
    granted: (permission) => {
      console.log('Permission Granted:', permission)
      state.replaceChildren(
        createCodeTag(permission.state, stateColor[permission.state])
      )
    },
    denied: (permission) => {
      console.log('Permission Denied:', permission)
      state.replaceChildren(
        createCodeTag(permission.state, stateColor[permission.state])
      )
    },
    error: (permission) => {
      console.log('Permission Error:', permission)
      state.replaceChildren(
        createCodeTag(permission.state, stateColor[permission.state])
      )
      error.textContent = permission.name + ': ' + permission.message
    }
  })

  permissionHandler.onPermissionChange((permission) => {
    console.log('Permission Change:', permission)
    state.replaceChildren(
      createCodeTag(permission.state + ' *', stateColor[permission.state])
    )
  })

  permissionHandler.getPermission()
  closeButton.replaceChildren(createCloseButton(option.name))
}

document
  .querySelector('#support')
  .appendChild(createCodeTag(isSupported().toString()))
document
  .querySelector('#names')
  .append(...permissionNames.map((name) => createCodeTag(name)))

const selectPermissions = [
  'unsupported-permission',
  'invalid-permission',
  ...permissionNames
]
const select = document.querySelector('#select')
select.append(...selectPermissions.map(createOptionTag))
select.addEventListener('change', (event) => {
  closeHandler()
  const name = event.target.value
  const userVisibleOnly = name === 'push' ? true : undefined
  const state = document.querySelector('#state')
  const error = document.querySelector('#error')

  state.replaceChildren(createCodeTag('-'))
  error.textContent = '-'

  if (name && selectPermissions.includes(name)) {
    handlePermission({
      name: name === 'invalid-permission' ? 'push' : name,
      userVisibleOnly
    })
  }
})
