import { Rule, RuleType } from '@midwayjs/validate';

export class RequestById {
  @Rule(RuleType.number().min(0).required())
  id: number;
}
