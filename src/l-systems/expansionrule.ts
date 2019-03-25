import NoiseFxns from './noisefxns';

class ExpansionRule {
  input: string;
  expansion: string;

  constructor(input: string) {
    this.input = input;
    if (input == "H") {
        // highway road type
    }
    else if (input == "G") {
        // grid road type
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
