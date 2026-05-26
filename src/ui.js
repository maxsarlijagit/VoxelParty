const userNameInput = document.querySelector('#user-name');
const userColorInput = document.querySelector('#user-color');
const addCubeButton = document.querySelector('#add-cube');
const deleteButton = document.querySelector('#delete-object');
const selectionLabel = document.querySelector('#selection-label');
const usersList = document.querySelector('#users-list');
const transformButtons = Array.from(document.querySelectorAll('[data-transform]'));
const syncStatus = document.querySelector('#sync-status');
const signalingStatus = document.querySelector('#signaling-status');

const storedUserName = localStorage.getItem('meshmosh-user-name');
const storedUserColor = localStorage.getItem('meshmosh-user-color');

userNameInput.value = storedUserName || `User-${crypto.randomUUID().slice(0, 4)}`;

if (storedUserColor) {
  userColorInput.value = storedUserColor;
}

function getLocalUserData() {
  return {
    name: userNameInput.value.trim() || 'Anonymous',
    color: userColorInput.value,
  };
}

function setTransformEnabled(isEnabled) {
  transformButtons.forEach((button) => {
    button.disabled = !isEnabled;
  });

  deleteButton.disabled = !isEnabled;
}

export function bindUi({ onAddCube, onDeleteSelected, onTransform, onUserChange }) {
  addCubeButton.addEventListener('click', onAddCube);
  deleteButton.addEventListener('click', onDeleteSelected);

  transformButtons.forEach((button) => {
    button.addEventListener('click', () => {
      onTransform({
        type: button.dataset.transform,
        axis: button.dataset.axis,
        amount: Number(button.dataset.amount),
      });
    });
  });

  [userNameInput, userColorInput].forEach((input) => {
    input.addEventListener('input', () => {
      const userData = getLocalUserData();
      localStorage.setItem('meshmosh-user-name', userData.name);
      localStorage.setItem('meshmosh-user-color', userData.color);
      onUserChange(userData);
    });
  });

  setTransformEnabled(false);
  onUserChange(getLocalUserData());
}

export function updateSelection(selectedId) {
  selectionLabel.textContent = selectedId ? `Seleccion: ${selectedId}` : 'Seleccion: ninguno';
  setTransformEnabled(Boolean(selectedId));
}

export function renderUsers(users) {
  usersList.replaceChildren();

  users.forEach((user) => {
    const item = document.createElement('li');
    const swatch = document.createElement('span');
    const name = document.createElement('span');

    item.className = 'user-pill';
    swatch.className = 'user-swatch';
    swatch.style.setProperty('--user-color', user.color ?? '#44d7b6');
    name.textContent = `${user.name}${user.clientId ? ` #${user.clientId}` : ''}`;

    item.append(swatch, name);
    usersList.append(item);
  });
}

export function renderConnectionStatus(status) {
  const peers = status.broadcastPeers + status.webrtcPeers;
  const connectedField = syncStatus.querySelector('[data-status-field="connected"]');
  const peersField = syncStatus.querySelector('[data-status-field="peers"]');
  const objectsField = syncStatus.querySelector('[data-status-field="objects"]');
  const connectedServers = status.signalingServers.filter((server) => server.connected);

  connectedField.textContent = status.connected ? 'Conectado' : 'Desconectado';
  connectedField.dataset.state = status.connected ? 'ok' : 'warn';
  peersField.textContent = `${peers} (${status.broadcastPeers} local / ${status.webrtcPeers} p2p)`;
  objectsField.textContent = String(status.objectCount);
  signalingStatus.textContent = `Signaling: ${connectedServers.length}/${status.signalingServers.length} servidores conectados`;
}
