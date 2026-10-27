# Preparación de la feria

## Preparar el equipo

1. Instalar dependencias, ejecutar `bun run test` y `bun run build`.
2. Ejecutar `bun run preview -- --host 127.0.0.1 --port 4173` y abrir la URL.
3. Desconectar internet y recorrer las tres rutas. Los enlaces a NASA sí
   necesitan conexión; no son necesarios para la demostración.
4. Probar pausa, reinicio, selección de planeta y misión completa en el equipo final.
5. Usar cargador y mouse. En equipos básicos, activar el modo de rendimiento
   dentro de las opciones del explorador.

El sitio compilado necesita un servidor HTTP: no abrir `dist/index.html`
directamente con `file://`. En hosting público, configurar las rutas de la SPA
para que redirijan a `index.html`.

## Recorrido de dos a cuatro minutos

- Invitar: «¿Quieres poner un satélite en órbita?».
- Explorar la Tierra y Saturno; girar la cámara para observar nubes, iluminación,
  anillos e inclinación. Explicar que las escalas están comprimidas.
- Abrir el laboratorio y pulsar «Comenzar misión».
- Ajustar a 400 km con «Ajuste preciso» y llevar la excentricidad a cero.
- Subir a 3.000 km manteniendo la órbita circular. Observar menor velocidad y
  mayor periodo. La misión reconoce los dos objetivos automáticamente.
- Abrir «¿Cómo lo calcula un programa?». Explicar entrada → cálculo → imagen:
  el visitante modificó datos y el algoritmo actualizó una representación 3D.
- Reiniciar entre visitantes. Usar el recorrido automático cuando nadie interactúa.

## Conectar con la carrera

Mostrar programación, modelado matemático, gráficos, interfaces, manejo de recursos
y pruebas como ejemplos concretos. Adaptar los nombres de asignaturas al plan
oficial, sin presentar un plan de estudios inventado.

## Pendiente del organizador

Identidad institucional, fecha, enlaces oficiales de admisión y hosting público.
Cuando exista una URL pública, generar un QR real para continuar en casa.

## Tercera experiencia: galería del universo

Abrir `/galeria-universo`. Empezar con Saturno: observar la rotación lenta, Titán
y Encélado. Mostrar Júpiter y sus cuatro lunas galileanas. Las escalas son
ilustrativas y las lunas están ampliadas para poder verlas.

Pasar a Galaxias y después a Agujeros negros. Comparar la visualización del disco
de acreción con la observación de M87*: una es una simulación científica y la otra
es una imagen reconstruida a partir de radio. Conectar esta última con algoritmos,
procesamiento de datos y redes de observatorios.

En Enanas blancas, mostrar Sirius B y localizar el punto pequeño, evitando
confundirlo con Sirius A. La Hélice muestra el gas alrededor de una enana blanca.
Cerrar con los acantilados de Carina y explicar los colores asignados al infrarrojo.

Para visitas libres: probar la búsqueda «enanas blancas», guardar un objeto y
abrir el modo inmersivo. Para atraer visitantes: activar el recorrido automático.
El recorrido cambia cada 14 segundos y se detiene si se pausa la animación.
