import {vec2, vec3, vec4, quat, mat4} from 'gl-matrix';

class NoiseFxns {
  fs_Pos: vec2;

  constructor(pos: vec2) {
    this.fs_Pos = pos;
  }

  random1(p: vec3, seed: vec3) {
    let a = vec3.create();
    a = vec3.add(a, p, seed);
    let b = vec3.fromValues(987.654, 123.456, 531.975);
    let val = Math.sin(vec3.dot(a, b)) * 85734.3545;
    return val - Math.floor(val);
  }

  random2(p: vec2, seed: vec2) {
    let a = vec2.create();
    a = vec2.add(a, p, seed);
    let b = vec2.fromValues(311.7, 127.1);
    let d = vec2.fromValues(269.5, 183.3);
    let c = vec2.fromValues(vec2.dot(a, b), vec2.dot(a, d));
    let e = vec2.fromValues(Math.sin(c[0]) * 85734.3545,
                            Math.sin(c[1]) * 85734.3545);
    let f = vec2.fromValues(e[0] - Math.floor(e[0]),
                            e[1] - Math.floor(e[1]));
    return f;
  }

  //Smoothstep (Adam's code)
  mySmoothStep(a: vec2, b: vec2, t: number) {
      t = Math.min(Math.max((t - 0.0) / (1.0 - 0.0), 0.0), 1.0);
      t = t * t * (3.0 - 2.0 * t);
      let c = vec2.fromValues(a[0] * (1.0 - t) + b[0] * t,
                              a[1] * (1.0 - t) + b[1] * t);
      return c;
  }

//2d Noise (Adam's code)
interpNoise2D(uv: vec2) {
    let uvFract = vec2.fromValues(uv[0] - Math.floor(uv[0]), 
                              uv[1] - Math.floor(uv[1]));
    let flooruv = vec2.fromValues(Math.floor(uv[0]), Math.floor(uv[1]));
    let ten = vec2.fromValues(10.0, 10.0);
    let ll = this.random2(flooruv, ten); //need to input seeds
    let temp = vec2.create();
    vec2.add(temp, flooruv, vec2.fromValues(1,0));
    let temp2 = vec2.create();
    vec2.add(temp2, flooruv, vec2.fromValues(0,1));
    let temp3 = vec2.create();
    vec2.add(temp3, flooruv, vec2.fromValues(1,1));
    let lr = this.random2(temp, ten);
    let ul = this.random2(temp2, ten);
    let ur = this.random2(temp3, ten);
    let lerpXL = this.mySmoothStep(ll, lr, uvFract[0]);
    let lerpXU = this.mySmoothStep(ul, ur, uvFract[0]);
    return this.mySmoothStep(lerpXL, lerpXU, uvFract[1]);
}

//FBM (Adam's base code)
fbm(uv: vec2) {
    let amp = 20.0;
    let freq = 1.0;
    let sum = vec2.fromValues(0.0, 0.0);
    let maxSum = 0.0;
    let octaves = 10; //can modify
    for(let i = 0; i < octaves; i++) {
        let result = vec2.fromValues(this.interpNoise2D(vec2.fromValues(uv[0] * freq, uv[1] * freq))[0] * amp,
                                     this.interpNoise2D(vec2.fromValues(uv[0] * freq, uv[1] * freq))[1] * amp);
        vec2.add(sum, sum, result);
        maxSum += amp;
        amp *= 0.5;
        freq *= 2.0;
    }
    return vec2.fromValues(sum[0] / maxSum, sum[1] / maxSum);
}

//Worley Noise (Adam's code)
WorleyNoise(uv: vec2) {
    // Tile the space
    let uvInt = vec2.fromValues(Math.floor(uv[0]), Math.floor(uv[1]));
    let uvFract = vec2.fromValues(uv[0] - uvInt[0], uv[1] - uvInt[1]);

    let minDist = 1.0; // Minimum distance initialized to max.

    // Search all neighboring cells and this cell for their point
    for(let y = -1; y <= 1; y++) {
        for(let x = -1; x <= 1; x++) {
            let neighbor = vec2.fromValues(x, y); // may not be floats?
            // Random point inside current neighboring cell
            let temp = vec2.create();
            temp = vec2.add(temp, uvInt, neighbor);
            let point = this.random2(temp, vec2.fromValues(10.0, 10.0));

            // Compute the distance b/t the point and the fragment
            // Store the min dist thus far
            let diff = vec2.fromValues(neighbor[0] + point[0] - uvFract[0], 
                                       neighbor[1] + point[1] - uvFract[1]);
            let dist = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
            minDist = Math.min(minDist, dist);
        }
    }
    return minDist;
}

};

export default NoiseFxns;
