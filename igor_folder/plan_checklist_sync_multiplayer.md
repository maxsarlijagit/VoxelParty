# Plan checklist: Sync Multiplayer P2P

Objetivo: dejar listas las funciones base de sincronizacion multiplayer para que Max pueda integrarlas al deploy principal.

## 1. Entender el punto de partida

- [x] Revisar `README.md` y confirmar que el proyecto usa Three.js, Yjs y `y-webrtc`.
- [x] Ubicar `src/sync.js`, `src/main.js`, `src/objects.js` y `src/ui.js`.
- [x] Identificar que parte del codigo ya esta conectada y que parte queda como `TODO`.
- [ ] Confirmar que la app corre localmente con dos pestanas en la misma URL.
- [x] Si `src/` o `package.json` todavia no existen en el fork local, coordinar antes de crear estructura nueva. Se decidio crear una base minima local para poder probar sync.

## 2. Definir la base de sync

- [x] Crear o revisar el `Y.Doc` principal.
- [x] Definir una sala unica para el desafio, por ejemplo `meshmosh-room`.
- [x] Conectar la sala usando `WebrtcProvider` de `y-webrtc`.
- [x] Exponer un `Y.Map` compartido para los objetos de la escena.
- [x] Exponer `awareness` para saber que usuarios estan conectados.
- [x] Mantener `sync.js` como unico modulo responsable de Yjs, WebRTC y awareness.
- [x] Tratar el `Y.Map` como fuente de verdad para la escena compartida.
- [x] Usar awareness solo para presencia temporal, no para objetos persistentes.

## 2.1. Definir formato de datos

- [x] Definir un formato simple para cada objeto compartido.
- [x] Usar un `id` unico por objeto, idealmente tambien como clave del `Y.Map`.
- [x] Guardar `type`, `position`, `rotation`, `scale` y datos visuales minimos como `color`.
- [x] Guardar solo datos JSON serializables.
- [x] Evitar guardar referencias de Three.js como `Mesh`, `Vector3`, `Euler`, `Material` o `Geometry`.
- [x] Confirmar que el estado permite reconstruir la escena despues de refrescar una pestana.

## 3. Preparar funciones reutilizables

- [x] Crear una funcion para agregar objetos al estado compartido.
- [x] Crear una funcion para actualizar transformaciones de un objeto existente.
- [x] Crear una funcion para borrar objetos si el alcance del desafio lo permite.
- [x] Crear un listener para reaccionar cuando cambia el `Y.Map`.
- [x] Mantener las funciones simples, separadas y faciles de integrar por Max.
- [x] Preparar una API minima: `addSharedObject`, `updateSharedObject`, `deleteSharedObject`, `observeSharedObjects`.
- [x] Preparar funciones de usuarios: `setLocalUser` y `observeUsers`.
- [x] Evitar que `main.js` concentre la logica de sync.

## 4. Conectar con Add Cube

- [x] Coordinar que `Add Cube` no cree solo un cubo local.
- [x] Hacer que `Add Cube` escriba un objeto nuevo en el `Y.Map`.
- [x] Confirmar que cada cubo tenga un id unico.
- [ ] Confirmar que el cubo aparece en todas las pestanas conectadas.
- [x] Confirmar que la creacion local y la creacion remota pasen por el mismo listener.
- [x] Mantener un `Map` local de meshes por id para no duplicar cubos.

## 5. Conectar con transform controls

- [x] Coordinar que mover, rotar o escalar actualice el objeto en el `Y.Map`.
- [x] Evitar que cada pestana duplique objetos al recibir cambios.
- [ ] Confirmar que una transformacion local se refleja en remoto.
- [ ] Confirmar que una transformacion remota actualiza la escena local.
- [x] No sincronizar transformaciones desde el render loop si no hay cambios reales.
- [x] Preferir eventos de transform controls, por ejemplo cambios de objeto o fin de drag. En esta base minima se usan botones de UI por evento.
- [x] Al recibir un cambio remoto, actualizar el mesh existente en vez de recrearlo.

## 6. Conectar awareness con UI

- [x] Definir que datos minimos representa cada usuario conectado.
- [x] Actualizar `awareness` al entrar a la sala.
- [x] Escuchar cambios de awareness para refrescar la lista de conectados.
- [x] Entregar a UI/UX una funcion o dato simple para renderizar usuarios.
- [x] Usar datos minimos: nombre, color y opcionalmente `clientId`.
- [x] No guardar awareness dentro del `Y.Map`, porque no necesita persistir.
- [ ] Confirmar que al cerrar o refrescar una pestana la lista se actualiza.

## 7. Pruebas minimas

- [ ] Abrir la app en dos pestanas o dos navegadores.
- [ ] Crear un cubo y verificar que aparece en ambas vistas.
- [ ] Mover un cubo y verificar que cambia en ambas vistas en menos de 1 segundo.
- [ ] Refrescar una pestana y verificar que reconecta.
- [ ] Entrar y salir con una pestana y verificar que cambia la lista de usuarios.
- [ ] Revisar consola y dejar sin errores obvios.
- [ ] Probar que refrescar una pestana reconstruye los objetos existentes desde el `Y.Map`.
- [ ] Probar que no aparecen objetos duplicados despues de crear, mover o refrescar.
- [ ] Probar dos navegadores distintos si hay tiempo, no solo dos pestanas.

## 8. Entrega para Max

- [x] Dejar claro que mi parte es sync multiplayer P2P.
- [x] No tocar configuracion de deploy salvo que sea imprescindible para compatibilidad.
- [x] Documentar funciones principales y puntos de integracion.
- [x] Avisar que Max se encarga de la union final, merge y deploy.
- [x] Preparar PR o nota de handoff con lo que quedo listo y lo que falta.
- [x] Incluir en el handoff la sala usada, la API exportada y como probar con dos pestanas.
- [x] Avisar cualquier supuesto tomado sobre estructura de archivos o dependencias.

## Orden sugerido de ejecucion

1. Confirmar archivos y dependencias.
2. Preparar `sync.js`.
3. Probar conexion P2P basica.
4. Sincronizar creacion de cubos.
5. Sincronizar transformaciones.
6. Conectar awareness a UI.
7. Probar con dos pestanas.
8. Entregar a Max para integracion y deploy.

## Estado actual

- Implementado: base minima Vite + Three.js, `sync.js` con Yjs/y-webrtc, `Y.Map` de objetos, awareness, Add Cube sincronizado, seleccion por click, transformaciones por botones y borrado.
- Validado: dependencias instaladas, `npm run build` correcto y dev server respondiendo HTTP 200 en `http://127.0.0.1:5173/`.
- Pendiente de prueba manual: validar interaccion multiplayer real con dos pestanas o dos navegadores.
- Supuesto tomado: como no existian `src/` ni `package.json`, se creo una base minima local para poder ejecutar la parte de sync.
