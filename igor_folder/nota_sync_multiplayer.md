# Nota de responsabilidad: Sync Multiplayer P2P

Yo me hago cargo de la parte de sincronizacion multiplayer, manteniendo la logica siempre peer-to-peer y sin backend central.

## Alcance principal

- Trabajar sobre la sincronizacion de estado compartido con Yjs.
- Mantener la conexion P2P usando `y-webrtc`.
- Asegurar que todos los usuarios entren a la misma sala del desafio.
- Sincronizar los objetos de la escena mediante un `Y.Map` compartido.
- Cuidar que las acciones principales se reflejen en todos los navegadores conectados.
- Revisar el uso de `awareness` para mostrar usuarios conectados en vivo.
- Mantener compatibilidad con GitHub Pages, sin servidor propio ni costo extra.
- Dejar las funciones de sync listas para correr sobre el deploy base existente.

## Enfoque tecnico recomendado

- Tratar el estado compartido como fuente de verdad: primero se escribe en Yjs, despues la escena local reacciona.
- Mantener toda la responsabilidad de red dentro de `sync.js`.
- Usar un unico `Y.Doc` para la sesion del desafio.
- Usar una sala fija y compartida, por ejemplo `meshmosh-room`.
- Usar `WebrtcProvider` de `y-webrtc` para conectar a los peers sin backend propio.
- Usar `Y.Map` para objetos persistentes de la escena.
- Usar `awareness` solo para presencia de usuarios, no para guardar objetos.
- Mantener datos simples y serializables: objetos JSON, numeros, strings y arrays simples.
- Evitar guardar referencias de Three.js dentro de Yjs, como `Mesh`, `Vector3`, `Euler` o materiales.

## Modelo sugerido para cada objeto

Cada entrada del `Y.Map` deberia representar un objeto de escena con un id unico:

```js
{
  id: "cube-123",
  type: "cube",
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  color: "#ffffff"
}
```

La clave del `Y.Map` puede ser el mismo `id`. Asi cada navegador puede saber si debe crear, actualizar o borrar el mesh local.

## Responsabilidades concretas

- Verificar que `sync.js` cree y exponga correctamente el documento compartido de Yjs.
- Confirmar que cada objeto 3D tenga una entrada clara y actualizable dentro del estado compartido.
- Coordinar con quien implemente `Add Cube` para que el alta de cubos se publique en la red P2P.
- Coordinar con quien implemente transform controls para que mover, rotar o escalar objetos actualice el estado compartido.
- Ayudar a UI/UX con la lista de usuarios conectados usando awareness.
- Evitar soluciones que dependan de un backend central, sockets propios o servicios pagos.
- Entregar funciones claras y separadas para que Max pueda unirlas al proyecto principal.
- No hacerme cargo de la union final ni del deploy: Max es quien integra, mergea y publica.

## API minima sugerida para `sync.js`

- `addSharedObject(objectData)`: agrega un objeto nuevo al `Y.Map`.
- `updateSharedObject(id, partialData)`: actualiza transformaciones o datos de un objeto existente.
- `deleteSharedObject(id)`: borra un objeto si el alcance lo permite.
- `observeSharedObjects(callback)`: avisa a la escena cuando cambia el `Y.Map`.
- `setLocalUser(userData)`: publica nombre/color del usuario actual con awareness.
- `observeUsers(callback)`: avisa a UI/UX cuando cambia la lista de usuarios conectados.

## Riesgos a evitar

- No crear un cubo local y ademas crearlo otra vez al recibir el cambio remoto.
- No sincronizar transformaciones en cada frame del render loop.
- No usar awareness para datos que deben persistir despues de refrescar la pagina.
- No depender de orden de llegada de mensajes; Yjs debe resolver el estado compartido.
- No mezclar muchas responsabilidades en `main.js`, porque es el archivo con mas riesgo de conflicto.
- No tocar configuracion de deploy salvo que sea imprescindible para GitHub Pages.

## Criterios de prueba

- Abrir la app en dos pestanas o navegadores y entrar a la misma sala.
- Crear un cubo en una pestana y confirmar que aparece en la otra.
- Mover un objeto y confirmar que el cambio se refleja en menos de 1 segundo.
- Refrescar una pestana y verificar que reconecta sin perder el estado compartido.
- Confirmar que la lista de usuarios conectados responde a entradas y salidas.

## Nota de enfoque

La prioridad es que el multiplayer sea simple, visible y demostrable durante el desafio de 30 minutos: varios usuarios editando la misma escena al mismo tiempo, desde el navegador, usando P2P.
