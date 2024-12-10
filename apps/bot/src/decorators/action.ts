import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface ActionDetails {
  name: string;
  description: string;
}

export function Action(actionDetails: ActionDetails) {
  return function (target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    target[key].actionDetails = actionDetails;
    return descriptor;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ActionNest = createParamDecorator((actionDetails: ActionDetails, ctx: ExecutionContext): ActionDetails => {
  return actionDetails;
});
