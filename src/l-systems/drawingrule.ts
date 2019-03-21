import { vec3, vec4, mat4, quat} from 'gl-matrix';

class DrawingRule { 
  input: string;
  public translation: number;
  public rotation: vec3; // euler angles in degrees
  scale: vec3;
  public color: vec3;
  public q: quat;
  public orientation: quat;
  public mat: mat4;
  public depth: number;
  scale_num: number;
  trans_num: number;
  scale_down: number;
  angle_num: number;

  constructor(input: string, iters: number) {
    this.input = input;
    this.translation = 0;
    this.rotation = vec3.fromValues(0, 0, 0);
    this.orientation = quat.create();
    this.q = quat.create();
    this.scale = vec3.fromValues(1.0, 1.0, 1.0);
    this.color = vec3.fromValues(1.0, 0.0, 0.0);
    this.mat = mat4.fromValues(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
    this.depth = 0;
    //this.scale_num = 1.0 * (1.0 / iters);
    this.scale_num = 10.0 * (1.0 / iters);
    this.trans_num = 2.0;
    this.scale_down = 0.9;
    this.angle_num = 25.0;
    this.getDrawOp(0, 0);
    this.reset();
  }

  reset() {
    this.translation = 0;
    this.rotation = vec3.fromValues(0, 0, 0);
    this.orientation = quat.create();
    this.q = quat.create();
    this.scale = vec3.fromValues(1.0, 1.0, 1.0);
    this.color = vec3.fromValues(1.0, 0.0, 0.0);
    this.mat = mat4.fromValues(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
  }

  getDrawOp(rand0: number, rand1: number) {
    console.log(this.input);
    console.log("called scale op");
    this.scaleOp();
    if (this.input == "+") {
        this.drawOp1(rand0, rand1);
    }
    else if (this.input == "-") {
        this.drawOp2(rand0, rand1);
    }
    else if (this.input == "F") {
        this.drawOp3();
    }
    else {
        console.log("invalid char");
    }
  }

  drawOp1(rand0: number, rand1: number) {
    // draws something
    this.rotation[0] += rand0;
    this.rotation[1] += rand1;
    this.rotation[2] += this.angle_num;
  }

  drawOp2(rand0: number, rand1: number) {
    // draws something
    var random0 = Math.random();
    var random1 = Math.random();
    random0 *= 10.0;
    random1 *= 10.0;
    this.rotation[0] -= rand0;
    this.rotation[1] -= rand1;
    this.rotation[2] -= this.angle_num;
  }

  drawOp3() {
    // draws something
    console.log("original:" + this.translation);
    this.translation += this.trans_num;
    console.log("final:" + this.translation);
  }

  scaleOp() {
      // scales based on recursion depth
      if (this.depth == 0) {
          this.scale = vec3.fromValues(this.scale_num,this.scale_num,this.scale_num);
          this.color = vec3.fromValues(1.0, 0.0, 0.0);
          console.log("same scale");
      }
      else if (this.depth == 1) {
            this.scale[0] *= (this.scale_down * (1.0 / this.depth) * this.scale_num);
            this.scale[1] *= (this.scale_down * (1.0 / this.depth) * this.scale_num);
            this.scale[2] *= (this.scale_down * (1.0 / this.depth) * this.scale_num);
            this.color = vec3.fromValues(0.0, 0.0, 1.0);
            console.log("scaled down");
      }
      else {
          this.scale[0] *= (this.scale_down * (1.0 / this.depth) * this.scale_num);
          this.scale[1] *= (this.scale_down * (1.0 / this.depth) * this.scale_num);
          this.scale[2] *= (this.scale_down * (1.0 / this.depth) * this.scale_num);
          this.color = vec3.fromValues(0.0, 1.0, 0.0);
          console.log("scaled down");
      }
  }
};

export default DrawingRule;
