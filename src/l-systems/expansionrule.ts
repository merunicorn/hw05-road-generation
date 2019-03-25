import NoiseFxns from './noisefxns';

class ExpansionRule {
  input: string;
  expansion: string;

  constructor(input: string) {
    this.input = input;
    if (input == "H") {
        // highway road type
        // branch or move forward
        let rand0 = Math.random();
        if (rand0 > 0.3) {
            // branch
            this.expansion = "B[H]";
        }
        else {
            // move forward
            this.expansion = "F[H]";
        }
    }
    else if (input == "G") {
        // grid road type
        this.expansion = "F[G]";
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
