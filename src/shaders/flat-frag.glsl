#version 300 es
precision highp float;

// The fragment shader used to render the background of the scene
// Modify this to make your background more interesting

out vec4 out_Col;

in vec3 fs_Pos;
uniform float u_Land;
uniform float u_Pop;
uniform float u_Overlay;

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

//Smoothstep (Adam's code)
vec2 mySmoothStep(vec2 a, vec2 b, float t) {
    t = smoothstep(0.0, 1.0, t);
    return mix(a, b, t);
}

//2d Noise (Adam's code)
vec2 interpNoise2D(vec2 uv) {
    vec2 uvFract = fract(uv);
    vec2 ll = random2(floor(uv), vec2(10.0)); //need to input seeds
    vec2 lr = random2(floor(uv) + vec2(1,0), vec2(10.0));
    vec2 ul = random2(floor(uv) + vec2(0,1), vec2(10.0));
    vec2 ur = random2(floor(uv) + vec2(1,1), vec2(10.0));

    vec2 lerpXL = mySmoothStep(ll, lr, uvFract.x);
    vec2 lerpXU = mySmoothStep(ul, ur, uvFract.x);

    return mySmoothStep(lerpXL, lerpXU, uvFract.y);
}

//FBM (Adam's base code)
vec2 fbm(vec2 uv) {
    float amp = 20.0;
    float freq = 1.0;
    vec2 sum = vec2(0.0);
    float maxSum = 0.0;
    int octaves = 10; //can modify
    for(int i = 0; i < octaves; i++) {
        sum += interpNoise2D(uv * freq) * amp;
        maxSum += amp;
        amp *= 0.5;
        freq *= 2.0;
    }
    return sum / maxSum;
}

//Worley Noise (Adam's code)
float WorleyNoise(vec2 uv) {
    // Tile the space
    vec2 uvInt = floor(uv);
    vec2 uvFract = fract(uv);

    float minDist = 1.0; // Minimum distance initialized to max.

    // Search all neighboring cells and this cell for their point
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));

            // Random point inside current neighboring cell
            vec2 point = random2(uvInt + neighbor, vec2(10.0));

            // Compute the distance b/t the point and the fragment
            // Store the min dist thus far
            vec2 diff = neighbor + point - uvFract;
            float dist = length(diff);
            minDist = min(minDist, dist);
        }
    }
    return minDist;
}

vec3 colorFxn(vec3 col) {
  return vec3(col / 255.0);
}

void main() {
  vec3 landCol = colorFxn(vec3(178.0, 222.0, 156.0));
  vec3 snowCol = colorFxn(vec3(230.0, 255.0, 196.0));
  vec3 waterCol = colorFxn(vec3(143.0, 178.0, 216.0));

  vec3 densePop = vec3(1.0);
  vec3 sparsePop = vec3(0.5);

  vec2 st = (fs_Pos.xy + 1.0) / 2.0;
  float fbmn = fbm(st).x;
  float worley = WorleyNoise(fs_Pos.xy);
  float worley2 = WorleyNoise(fbm(fs_Pos.yx));

  float pop = WorleyNoise(fs_Pos.xy * 2.0);
  pop /= fbmn / 1.5;
  pop = 1.0 - pop;

  worley2 /= fbmn * 1.8;

  worley2 += worley / 5.0;

  fbmn = clamp(fbmn, 0.0, 1.0);
  worley2 = 1.0 - worley2;
  worley2 = clamp(worley2, 0.0, 1.0);
  pop = clamp(pop, 0.0, 1.0);

  vec4 elevCol;
  vec4 popCol;

  if (u_Land == 1.0) {
    if (worley2 < 0.3) {
      elevCol = vec4(waterCol, 1.0);
    }
    else if (worley2 > 0.65) {
      elevCol = vec4(snowCol, 1.0);
    }
    else if (worley2 > 0.4) {
      if (worley2 < 0.46) {
        elevCol = vec4(mix(landCol, snowCol, 0.2), 1.0);
      }
      else if (worley2 < 0.55) {
        elevCol = vec4(mix(landCol, snowCol, 0.4), 1.0);
      }
      else {
        elevCol = vec4(mix(landCol, snowCol, 0.8), 1.0);
      }
    }
    else {
      elevCol = vec4(landCol, 1.0);
    }
  }
  else {
    if (worley2 < 0.3) {
      elevCol = vec4(waterCol, 1.0);
    }
    else {
      elevCol = vec4(landCol, 1.0);
    }
  }

  out_Col = elevCol;
  
  if (worley2 < 0.3) {
    popCol = vec4(waterCol, 1.0);
  }
  else if (pop < 0.5) {
    popCol = vec4(sparsePop, 1.0);
  }
  else if (pop < 0.8) {
    popCol = vec4(mix(sparsePop, densePop, 0.5), 1.0);
  }
  else {
    popCol = vec4(densePop, 1.0);
  }

  if (u_Pop == 1.0) {
    out_Col = popCol;
  }

  if(u_Overlay == 1.0) {
    out_Col = vec4(mix(vec3(elevCol), vec3(popCol), 0.4), 1.0);
  }
}
