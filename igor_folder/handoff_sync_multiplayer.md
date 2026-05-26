# Handoff: Sync Multiplayer P2P

## Que quedo listo

- Base minima Vite + vanilla JS dentro de `VoxelParty`.
- Escena Three.js con camara, luces, grid y OrbitControls.
- Sala P2P fija: `meshmosh-room`.
- Estado compartido en Yjs mediante `Y.Map` llamado `objects`.
- Conexion P2P con `WebrtcProvider` de `y-webrtc`.
- Awareness conectado a una lista simple de usuarios.
- `Add Cube` escribe primero en Yjs; la escena local se reconstruye desde el listener.
- Transformaciones basicas por botones de UI: mover, rotar en Y y escalar.
- Borrado del objeto seleccionado.

## API exportada por `src/sync.js`

- `addSharedObject(objectData)`
- `updateSharedObject(id, partialData)`
- `deleteSharedObject(id)`
- `observeSharedObjects(callback)`
- `setLocalUser(userData)`
- `observeUsers(callback)`
- `getSharedObject(id)`
- `ROOM_NAME`

## Formato de objeto compartido

```js
{
  id: "cube-uuid",
  type: "cube",
  position: { x: 0, y: 0.5, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  color: "#44d7b6"
}
```

## Como probar

1. Instalar dependencias en `VoxelParty`.
2. Correr `npm run dev`.
3. Abrir la misma URL en dos pestanas o dos navegadores.
4. Cambiar el nombre/color de usuario y verificar la lista de conectados.
5. Crear un cubo en una pestana y confirmar que aparece en ambas.
6. Seleccionar el cubo con click y usar los botones de transform.
7. Refrescar una pestana y confirmar que reconstruye la escena desde Yjs.

## Supuestos

- No habia `src/` ni `package.json`, asi que se creo una base minima local.
- No se agrego backend ni configuracion de deploy fuera de `vite.config.js`.
- La union final, merge y deploy quedan fuera de esta entrega.
