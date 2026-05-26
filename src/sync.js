import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export const ROOM_NAME = 'meshmosh-room';

const doc = new Y.Doc();
const objectsMap = doc.getMap('objects');
const provider = new WebrtcProvider(ROOM_NAME, doc);
const awareness = provider.awareness;

function cloneSharedValue(value) {
  return structuredClone(value);
}

function getSharedObjectsSnapshot() {
  return Array.from(objectsMap.values(), cloneSharedValue);
}

export function addSharedObject(objectData) {
  if (!objectData?.id) {
    throw new Error('addSharedObject necesita un objeto con id.');
  }

  objectsMap.set(objectData.id, cloneSharedValue(objectData));
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
}

export function deleteSharedObject(id) {
  objectsMap.delete(id);
}

export function observeSharedObjects(callback) {
  const notify = () => callback(getSharedObjectsSnapshot());

  notify();
  objectsMap.observe(notify);

  return () => objectsMap.unobserve(notify);
}

export function setLocalUser(userData) {
  awareness.setLocalStateField('user', cloneSharedValue(userData));
}

export function observeUsers(callback) {
  const notify = () => {
    const users = Array.from(awareness.getStates().entries()).map(([clientId, state]) => ({
      clientId,
      ...state.user,
    }));

    callback(users.filter((user) => user.name));
  };

  notify();
  awareness.on('change', notify);

  return () => awareness.off('change', notify);
}

export function getSharedObject(id) {
  const objectData = objectsMap.get(id);
  return objectData ? cloneSharedValue(objectData) : null;
}
