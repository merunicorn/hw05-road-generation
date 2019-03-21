#version 300 es
precision highp float;

// The fragment shader used to render the background of the scene
// Modify this to make your background more interesting

out vec4 out_Col;

in float fs_FBM;
in vec3 fs_Pos;

vec3 colorFxn(vec3 col) {
  return vec3(col / 255.0);
}

void main() {

  vec3 landCol = colorFxn(vec3(178.0, 222.0, 156.0));
  vec3 waterCol = colorFxn(vec3(143.0, 178.0, 216.0));

  float fbm = fs_FBM * fs_FBM;
  //fbm = clamp(fbm, 0.0, 1.0);

  /*if (fbm < 0.2) {
    out_Col = vec4(landCol, 1.0);
  }
  else if (fbm < 0.3) {
    vec3 col_mix = vec3(mix(landCol, waterCol, fbm));
    out_Col = vec4(col_mix, 1.0);
  }
  else if (fbm < 0.4) {
    out_Col = vec4(vec3(255.0, 0.0, 0.0), 1.0);
  }
  else {
    out_Col = vec4(waterCol, 1.0);
  }*/

  out_Col = vec4(vec3(0.0) + vec3(fbm), 1.0);
  
  //out_Col = vec4(164.0 / 255.0, 233.0 / 255.0, 1.0, 1.0);
}
