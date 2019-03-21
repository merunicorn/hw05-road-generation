
class ExpansionRule {
  input: string;
  expansion: string;

  constructor(input: string) {
    this.input = input;
    if (input == "F") {
        this.expansion = "FF";
    }
    else if (input == "X") {
        //this.expansion = "F[+X][-X][++FX][-F]FX"
        this.expansion = "FF[+LX][-LX]FFLX"
    }
    else if (input == "L") {
        this.expansion = "F[X][X]L";
    }
    else {
        this.expansion = input;
    }
  }

  getExpansion(): string {
    return this.expansion;
  }
};

export default ExpansionRule;
