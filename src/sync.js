import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export const ROOM_NAME = 'meshmosh-room';
export const SIGNALING_SERVERS = [
  'ws://127.0.0.1:4444',
  'wss://y-webrtc-eu.fly.dev',
  'wss://signaling.yjs.dev',
];

const doc = new Y.Doc();
const objectsMap = doc.getMap('objects');
const provider = new WebrtcProvider(ROOM_NAME, doc, {
  signaling: SIGNALING_SERVERS,
  filterBcConns: false,
});
const awareness = provider.awareness;
const connectionObservers = new Set();

function cloneSharedValue(value) {
  return structuredClone(value);
}

function getSharedObjectsSnapshot() {
  return Array.from(objectsMap.values(), cloneSharedValue);
}

function getConnectionStatus() {
  const room = provider.room;

  return {
    connected: provider.connected,
    synced: Boolean(room?.synced),
    broadcastPeers: room?.bcConns.size ?? 0,
    webrtcPeers: room?.webrtcConns.size ?? 0,
    signalingServers: provider.signalingConns.map((connection) => ({
      url: connection.url,
      connected: connection.connected,
    })),
    objectCount: objectsMap.size,
    userCount: awareness.getStates().size,
  };
}

function notifyConnectionObservers() {
  const status = getConnectionStatus();
  connectionObservers.forEach((callback) => callback(status));
}

export function addSharedObject(objectData) {
  if (!objectData?.id) {
    throw new Error('addSharedObject necesita un objeto con id.');
  }

  objectsMap.set(objectData.id, cloneSharedValue(objectData));
  notifyConnectionObservers();
}

export function updateSharedObject(id, partialData) {
  const currentObject = objectsMap.get(id);

  if (!currentObject) {
    return;
  }

  objectsMap.set(id, {
    ...currentObject,
    ...cloneSharedValue(partialData),
  });
  notifyConnectionObservers();
}

export function deleteSharedObject(id) {
  objectsMap.delete(id);
  notifyConnectionObservers();
}

export function observeSharedObjects(callback) {
  const notify = () => {
    callback(getSharedObjectsSnapshot());
    notifyConnectionObservers();
  };

  notify();
  objectsMap.observe(notify);

  return () => objectsMap.unobserve(notify);
}

export function setLocalUser(userData) {
  awareness.setLocalStateField('user', cloneSharedValue(userData));
  notifyConnectionObservers();
}

export function observeUsers(callback) {
  const notify = () => {
    const users = Array.from(awareness.getStates().entries()).map(([clientId, state]) => ({
      clientId,
      ...state.user,
    }));

    callback(users.filter((user) => user.name));
    notifyConnectionObservers();
  };

  notify();
  awareness.on('change', notify);

  return () => awareness.off('change', notify);
}

export function getSharedObject(id) {
  const objectData = objectsMap.get(id);
  return objectData ? cloneSharedValue(objectData) : null;
}

export function observeConnectionStatus(callback) {
  connectionObservers.add(callback);
  callback(getConnectionStatus());

  provider.on('status', notifyConnectionObservers);
  provider.on('synced', notifyConnectionObservers);

  return () => {
    connectionObservers.delete(callback);

    if (connectionObservers.size === 0) {
      provider.off('status', notifyConnectionObservers);
      provider.off('synced', notifyConnectionObservers);
    }
  };
}
