import { vec2, mat3 } from 'gl-matrix';

class DrawingRule { 
  input: string;
  public translation: number;
  public rotation: number; // angle in degrees
  scale: vec2;
  public mat: mat3;
  public depth: number;
  scale_num: number;
  trans_num: number;
  scale_down: number;
  angle_num: number;

  constructor(input: string, iters: number) {
    this.input = input;
    this.translation = 0;
    this.rotation = 0;
    this.scale = vec2.fromValues(1.0, 1.0);
    this.mat = mat3.fromValues(1,0,0,0,1,0,0,0,1);
    this.depth = 0;
    this.scale_num = 1.0 * (1.0 / iters);
    this.trans_num = 2.0;
    this.scale_down = 0.9;
    this.angle_num = 25.0;
    this.getDrawOp(0, 0);
    this.reset();
  }

  reset() {
    this.translation = 0;
    this.rotation = 0;
    this.scale = vec2.fromValues(1.0, 1.0);
      this.mat = mat3.fromValues(1,0,0,0,1,0,0,0,1);
  }

  getDrawOp(rand0: number, rand1: number) {
    this.scaleOp();
    if (this.input == "F") {
      this.drawForward();
    }
    else if (this.input == "G") {
      // drawing grid streets
      this.drawGrid();
    }
    else {
      console.log("invalid char");
    }
  }

  drawForward() {
    this.translation = 4; //move forward 4
  }

  drawGrid() {
    this.rotation = 90; //turn 90 degrees
    this.drawForward();
  }

  /*drawOp2(rand0: number, rand1: number) {
    // draws something
    var random0 = Math.random();
    var random1 = Math.random();
    random0 *= 10.0;
    random1 *= 10.0;
    this.rotation -= this.angle_num;
  }*/

  scaleOp() {
    // if needs to scale down, edit this.scale here
    this.scale[1] *= 4.0;
  }
};

export default DrawingRule;
