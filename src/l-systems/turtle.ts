import {vec3, mat4, quat, vec4} from 'gl-matrix';

class Turtle {
  position: vec3 = vec3.create();
  public orientation: quat = quat.create();
  recurDepth: number = 0;
  penColor: vec3 = vec3.create();

  constructor(position: vec3, orientation: quat, 
              recurDepth: number, penColor: vec3) {
    this.position = position;
    this.orientation = quat.create();
    this.recurDepth = recurDepth;
    this.penColor = penColor;
    this.addTranslation = this.addTranslation.bind(this);
    this.updateOrientation = this.updateOrientation.bind(this);
    this.setDepth = this.setDepth.bind(this);
    this.setColor = this.setColor.bind(this);
  }

  addTranslation(translate: number) {
    let orient = vec4.create();
    let t = mat4.create();
    mat4.fromQuat(t, this.orientation);
    // update based on up vector and new orientation matrix
    vec4.transformMat4(orient, vec4.fromValues(0.0,1.0,0.0,1.0), t);
    let trans = vec3.create();
    trans = vec3.fromValues(orient[0] * translate,
              orient[1] * translate,
              orient[2] * translate);
    vec3.add(this.position, this.position, trans);
  }

  updateOrientation(rot: vec3) {
    let q = quat.create();
    quat.fromEuler(q, rot[0], rot[1], rot[2]);
    quat.multiply(this.orientation, this.orientation, q);
  }

  setDepth(depth: number) {
    this.recurDepth = depth;
  }

  setColor(color: vec3) {
    this.penColor = color;
  }
};

export default Turtle;
