interface LogicRule {
  sourceFieldId: string;

  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";

  comparisonValue: any;

  action:
    | "show"
    | "hide"
    | "goto_step"
    | "end";

  targetFieldId?: string;

  targetStepId?: string;
}


export function evaluateRule(
  rule: LogicRule,
  answers: Record<string, any>
) {

  const actual =
    answers[rule.sourceFieldId];

  switch (rule.operator) {

    case "equals":

      return actual ===
        rule.comparisonValue;


    case "not_equals":

      return actual !==
        rule.comparisonValue;


    case "contains":

      return String(actual ?? "")
        .includes(
          String(rule.comparisonValue)
        );


    case "greater_than":

      return Number(actual) >
        Number(rule.comparisonValue);


    case "less_than":

      return Number(actual) <
        Number(rule.comparisonValue);


    default:

      return false;
  }
}
