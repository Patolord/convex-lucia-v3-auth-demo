import { PropertyValidators, ObjectType } from "convex/values";
import { Session, User } from "lucia";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { Auth } from "../auth/lucia";
import { entsTableFactory } from "convex-ents";
import { entDefinitions } from "../schema";

export type UserSessionContext =
  | {
      user: User;
      session: Session;
    }
  | {
      user: null;
      session: null;
    }
  | null;

export type MutationWithAuth<
  ArgsValidator extends PropertyValidators,
  Output
> = {
  args: ArgsValidator;
  handler: (
    ctx: Omit<MutationCtx, "auth"> & {
      auth: Auth;
      userSessionContext: UserSessionContext;
      table: ReturnType<
        typeof entsTableFactory<MutationCtx, typeof entDefinitions>
      >;
    },
    args: ObjectType<ArgsValidator>
  ) => Output;
};

export type QueryWithAuth<ArgsValidator extends PropertyValidators, Output> = {
  args: ArgsValidator;
  handler: (
    ctx: Omit<QueryCtx, "auth"> & {
      auth: Auth;
      userSessionContext: UserSessionContext;
      table: ReturnType<
        typeof entsTableFactory<QueryCtx, typeof entDefinitions>
      >;
    },
    args: ObjectType<ArgsValidator>
  ) => Output;
};
export type AuthResponse = {
  cookie: string | undefined;
  success: boolean;
  message: string | undefined;
};
