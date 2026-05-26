import './style.css';
import * as THREE from 'three';
import { createScene } from './scene.js';
import {
  addSharedObject,
  deleteSharedObject,
  getSharedObject,
  observeSharedObjects,
  observeUsers,
  ROOM_NAME,
  setLocalUser,
  updateSharedObject,
} from './sync.js';
import {
  createCubeData,
  getMeshById,
  getSelectableMeshes,
  getSelectedObjectId,
  setSelectedObject,
  syncSceneObjects,
} from './objects.js';
import { bindUi, renderUsers, updateSelection } from './ui.js';

const viewport = document.querySelector('#viewport');
const roomName = document.querySelector('#room-name');
const { scene, camera, renderer } = createScene(viewport);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let pendingSelectionId = null;

roomName.textContent = ROOM_NAME;

function refreshSelection() {
  updateSelection(getSelectedObjectId());
}

function selectObject(id) {
  const selectedId = setSelectedObject(id);
  updateSelection(selectedId);
}

function handleCanvasClick(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const [hit] = raycaster.intersectObjects(getSelectableMeshes(), false);
  selectObject(hit?.object.userData.sharedId ?? null);
}

function moveObject(objectData, axis, amount) {
  const nextPosition = {
    ...objectData.position,
    [axis]: Number(((objectData.position?.[axis] ?? 0) + amount).toFixed(3)),
  };

  updateSharedObject(objectData.id, { position: nextPosition });
}

function rotateObject(objectData, axis, amount) {
  const nextRotation = {
    ...objectData.rotation,
    [axis]: Number(((objectData.rotation?.[axis] ?? 0) + amount).toFixed(3)),
  };

  updateSharedObject(objectData.id, { rotation: nextRotation });
}

function scaleObject(objectData, amount) {
  const currentScale = objectData.scale ?? { x: 1, y: 1, z: 1 };
  const nextScaleValue = Math.max(0.2, Number(((currentScale.x ?? 1) + amount).toFixed(3)));

  updateSharedObject(objectData.id, {
    scale: {
      x: nextScaleValue,
      y: nextScaleValue,
      z: nextScaleValue,
    },
  });
}

function handleTransform({ type, axis, amount }) {
  const selectedId = getSelectedObjectId();
  const objectData = selectedId ? getSharedObject(selectedId) : null;

  if (!objectData) {
    selectObject(null);
    return;
  }

  if (type === 'move') {
    moveObject(objectData, axis, amount);
  }

  if (type === 'rotate') {
    rotateObject(objectData, axis, amount);
  }

  if (type === 'scale') {
    scaleObject(objectData, amount);
  }
}

observeSharedObjects((sharedObjects) => {
  syncSceneObjects(scene, sharedObjects);

  if (pendingSelectionId && getMeshById(pendingSelectionId)) {
    selectObject(pendingSelectionId);
    pendingSelectionId = null;
    return;
  }

  refreshSelection();
});

observeUsers(renderUsers);

bindUi({
  onAddCube() {
    const cubeData = createCubeData();
    pendingSelectionId = cubeData.id;
    addSharedObject(cubeData);
  },
  onDeleteSelected() {
    const selectedId = getSelectedObjectId();

    if (selectedId) {
      deleteSharedObject(selectedId);
      selectObject(null);
    }
  },
  onTransform: handleTransform,
  onUserChange: setLocalUser,
});

renderer.domElement.addEventListener('click', handleCanvasClick);
