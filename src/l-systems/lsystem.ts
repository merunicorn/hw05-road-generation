import {vec2, vec3, vec4, quat, mat4} from 'gl-matrix';
import Turtle from './turtle';
import ExpansionRule from './expansionrule';
import DrawingRule from './drawingrule';

class LSystem {
  turtlestack: Array<Turtle>;
  expmap: Map<string, ExpansionRule>;
  drawmap: Map<string, DrawingRule>;
  alphabet: Array<string>;
  axiom: string;
  newaxiom: string;
  public mat: mat4;
  public matb: mat4;
  public transfvecs: Array<vec4>;
  public btransfvecs: Array<vec4>;
  public colors: Array<vec4>;
  public bcolors: Array<vec4>;
  iters: number;

  constructor(input: string, alphabet: Array<string>, iters: number) {
    
    this.axiom = input;
    this.alphabet = alphabet;
    this.expmap = new Map();
    this.drawmap = new Map();
    this.turtlestack = new Array();
    this.mat = mat4.create();
    this.matb = mat4.create();
    this.transfvecs = new Array();
    this.btransfvecs = new Array();
    this.colors = new Array();
    this.bcolors = new Array();
    this.iters = iters;
    this.fillExpMap();
    this.fillDrawMap();
    this.lsysParse(iters);
    this.lsysExecute();
  }

  lsysParse(iters: number) {
      this.newaxiom = "";
      for (var i = 0; i < iters; i++) {
        for (let letter of this.axiom) {
            //find expansion string for letter
            let newstr = this.expmap.get(letter).getExpansion();
            //replace letter with new expansion
            this.newaxiom += newstr;
        }
        if (i != iters-1) {
            this.axiom = this.newaxiom;
            this.newaxiom = "";
        }
      }
  }

  lsysExecute() {
      let recurDepth = 0;
      let turt = new Turtle(vec2.fromValues(0, 0), 
                            vec2.fromValues(0, 0), recurDepth);
      let currentTurt = turt;
      let arrLength = 0;
      for (let letter of this.newaxiom) {
          if (letter == "[") {
              recurDepth++;
              // clone turtle
              let new_pos = vec2.create();
              vec2.copy(new_pos, currentTurt.position);
              let new_ori = vec2.create();
              vec2.copy(new_ori, currentTurt.orientation);
              let copyTurt = new Turtle(new_pos, new_ori, recurDepth);

              // push clone onto stack
              arrLength = this.pushTurtle(copyTurt);
          }
          else if (letter == "]") {
              // update working turtle to one about to pop
              // pop turtle off stack
              currentTurt = this.popTurtle();
              arrLength--;
              recurDepth--;
          }
          else if (letter != "F") {
              // don't draw but update turtle
              let draw = this.drawmap.get(letter);
              draw.depth = recurDepth;
              var random0 = Math.random();
              var random1 = Math.random();
              random0 *= 100.0;
              random1 *= 100.0;
              draw.getDrawOp(random0, random1);
              currentTurt.addTranslation(draw.translation);
              currentTurt.updateOrientation(draw.rotation);
              currentTurt.setDepth(recurDepth);
              draw.reset();
          }
          else {
              let draw = this.drawmap.get(letter);
              
              draw.depth = recurDepth;
              var random0 = Math.random();
              var random1 = Math.random();
              random0 *= 100.0;
              random1 *= 100.0;
              draw.getDrawOp(random0, random1);
              let previousPos = vec2.create();
              previousPos = vec2.copy(previousPos, currentTurt.position);
              // apply drawing rule transformations to turtle
              // also calls the drawing function
              currentTurt.addTranslation(draw.translation);
              currentTurt.updateOrientation(draw.rotation);
              currentTurt.setDepth(recurDepth);

              let posSize = vec3.create();
              for (let l = 0; l < 3; l++) {
                  posSize[l] = currentTurt.position[l] - previousPos[l];
              }
              let scaleAmt = vec3.length(posSize);
              let scaleTurt = vec3.create();
              let scaleBud = vec3.create();
              var randBud = Math.random();
              for (let m = 0; m < 3; m++) {
                  scaleTurt[m] = (draw.scale[m] * 1.8);
                  scaleBud[m] = scaleAmt / (draw.scale_num * 3.0);
              }

              //this.setUpTransfMat(currentTurt.orientation, previousPos, scaleTurt);
              //this.setUpBTransfMat(currentTurt.orientation, previousPos, scaleBud);

              // set up the transformation vec4s
              for (var i = 0; i < 4; i++) {
                this.transfvecs.push(vec4.fromValues(this.mat[i+0],
                                                     this.mat[i+4],
                                                     this.mat[i+8],
                                                     this.mat[i+12]));
              }

              if (randBud < 0.3 && recurDepth >= 3) {
                  for (var j = 0; j < 4; j++) {
                      this.btransfvecs.push(vec4.fromValues(this.matb[j+0],
                                                            this.matb[j+4],
                                                            this.matb[j+8],
                                                            this.matb[j+12]));
                  }
                  this.bcolors.push(vec4.fromValues(1.0,
                    (52.0/255.0),
                    (85.0/255.0),
                    1.0));
              }  

              this.colors.push(vec4.fromValues((157.0/255.0),
                                               (202.0/255.0),
                                               (114.0/255.0),
                                               1.0));
              draw.reset();
          }
      }
  }

  fillExpMap() {
    for (var i = 0; i < this.alphabet.length; i++) {
        let letter = this.alphabet[i];
        let exprule = new ExpansionRule(letter);
        this.expmap.set(letter, exprule);
    }
  }

  fillDrawMap() {
    for (var i = 0; i < this.alphabet.length; i++) {
        let letter = this.alphabet[i];
        let drawrule = new DrawingRule(letter, this.iters);
        this.drawmap.set(letter, drawrule);
    }
  }

  pushTurtle(turt: Turtle) {
      // push turt to stack and return new length
      return this.turtlestack.push(turt);
  }

  popTurtle() {
      // pop stack and return popped turtle
      return this.turtlestack.pop();
  }

  setUpTransfMat(rot: quat, trans: vec3, scale: vec3) {
    let t = mat4.create();
    mat4.fromTranslation(t, trans);
    let r = mat4.create();
    mat4.fromQuat(r, rot);
    let s = mat4.create();
    mat4.fromScaling(s, scale);
    mat4.multiply(this.mat,t,r);
    mat4.multiply(this.mat,this.mat,s);
  }

  setUpBTransfMat(rot: quat, trans: vec3, scale: vec3) {
    let t = mat4.create();
    mat4.fromTranslation(t, trans);
    let r = mat4.create();
    mat4.fromQuat(r, rot);
    let s = mat4.create();
    mat4.fromScaling(s, scale);
    mat4.multiply(this.matb,t,r);
    mat4.multiply(this.matb,this.matb,s);
  }
};

export default LSystem;
