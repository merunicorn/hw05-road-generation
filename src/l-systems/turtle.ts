import {vec2} from 'gl-matrix';

class Turtle {
  public position: vec2 = vec2.create();
  public orientation: vec2 = vec2.create();
  recurDepth: number = 0;

  constructor(position: vec2, orientation: vec2, 
              recurDepth: number) {
    this.position = position;
    this.orientation = orientation;
    this.recurDepth = recurDepth;
    this.addTranslation = this.addTranslation.bind(this);
    this.updateOrientation = this.updateOrientation.bind(this);
    this.setDepth = this.setDepth.bind(this);
  }

  addTranslation(translate: number) {
    let trans = vec2.fromValues(this.orientation[0] * translate,
                            this.orientation[1] * translate);
    vec2.add(this.position, this.position, trans);
  }

  updateOrientation(rot: number) {
    // convert to radians
    rot *= 180.0 / Math.PI;
    // get direction vector
    let orient = vec2.fromValues(Math.cos(rot), Math.sin(rot));
    vec2.add(this.orientation, this.orientation, orient);
    vec2.normalize(this.orientation, this.orientation);
  }

  setDepth(depth: number) {
    this.recurDepth = depth;
  }
};

export default Turtle;
