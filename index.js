var gl; // Un variable global para el contexto WebGL

function start() {
  var canvas = document.getElementById("glcanvas");

  gl = initWebGL(canvas);      // Inicializar el contexto GL

  // Solo continuar si WebGL esta disponible y trabajando

  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Establecer el color base en negro, totalmente opaco
    gl.enable(gl.DEPTH_TEST);                               // Habilitar prueba de profundidad
    gl.depthFunc(gl.LEQUAL);                                // Objetos cercanos opacan objetos lejanos
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Limpiar el buffer de color asi como el de profundidad
  }
}
