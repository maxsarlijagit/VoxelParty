import * as THREE from 'three';

const meshesById = new Map();
let selectedObjectId = null;

function toVectorData(value, fallback) {
  return {
    x: Number(value?.x ?? fallback.x),
    y: Number(value?.y ?? fallback.y),
    z: Number(value?.z ?? fallback.z),
  };
}

function createCubeMesh(objectData) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: objectData.color ?? '#ffffff',
    roughness: 0.55,
    metalness: 0.08,
  });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.sharedId = objectData.id;

  return mesh;
}

function applyObjectData(mesh, objectData) {
  const position = toVectorData(objectData.position, { x: 0, y: 0.5, z: 0 });
  const rotation = toVectorData(objectData.rotation, { x: 0, y: 0, z: 0 });
  const scale = toVectorData(objectData.scale, { x: 1, y: 1, z: 1 });

  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  mesh.scale.set(scale.x, scale.y, scale.z);

  if (objectData.color) {
    mesh.material.color.set(objectData.color);
  }

  mesh.material.emissive.set(mesh.userData.sharedId === selectedObjectId ? '#334411' : '#000000');
}

export function syncSceneObjects(scene, sharedObjects) {
  const incomingIds = new Set(sharedObjects.map((objectData) => objectData.id));

  sharedObjects.forEach((objectData) => {
    if (objectData.type !== 'cube') {
      return;
    }

    let mesh = meshesById.get(objectData.id);

    if (!mesh) {
      mesh = createCubeMesh(objectData);
      meshesById.set(objectData.id, mesh);
      scene.add(mesh);
    }

    applyObjectData(mesh, objectData);
  });

  meshesById.forEach((mesh, id) => {
    if (incomingIds.has(id)) {
      return;
    }

    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    meshesById.delete(id);

    if (selectedObjectId === id) {
      selectedObjectId = null;
    }
  });
}

export function createCubeData() {
  const id = crypto.randomUUID();

  return {
    id,
    type: 'cube',
    position: {
      x: Number((Math.random() * 4 - 2).toFixed(2)),
      y: 0.5,
      z: Number((Math.random() * 4 - 2).toFixed(2)),
    },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`,
  };
}

export function getMeshById(id) {
  return meshesById.get(id) ?? null;
}

export function getSelectableMeshes() {
  return Array.from(meshesById.values());
}

export function getSelectedObjectId() {
  return selectedObjectId;
}

export function setSelectedObject(id) {
  selectedObjectId = meshesById.has(id) ? id : null;

  meshesById.forEach((mesh) => {
    mesh.material.emissive.set(mesh.userData.sharedId === selectedObjectId ? '#334411' : '#000000');
  });

  return selectedObjectId;
}
