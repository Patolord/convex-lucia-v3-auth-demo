import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./auth/withAuth";
import { Scrypt, generateIdFromEntropySize } from "lucia";

export const getSession = queryWithAuth({
  args: {},
  handler: async (ctx) => {
    return {
      session: JSON.stringify(ctx.userSessionContext?.session),
      cookie: ctx.userSessionContext?.session?.fresh
        ? ctx.auth
            .createSessionCookie(ctx.userSessionContext.session.id)
            .serialize()
        : undefined,
    };
  },
});

export const get = queryWithAuth({
  args: {},
  handler: async (ctx) => {
    return ctx.userSessionContext?.user;
  },
});

export const signIn = mutationWithAuth({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return "User not found";
    }

    const passwordMatches = await new Scrypt().verify(
      user.password_hash,
      args.password
    );

    if (!passwordMatches) {
      return "Invalid password";
    }

    const session = await ctx.auth.createSession(user.id, {
      email: user.email,
    });
    const cookie = ctx.auth.createSessionCookie(session.id).serialize();
    return { cookie };
  },
});

export const signUp = mutationWithAuth({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const id = generateIdFromEntropySize(10);
    const hashedPassword = await new Scrypt().hash(args.password);

    const isExistingUser = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();

    if (isExistingUser) {
      return "Username already exists";
    }

    const session = await ctx.auth.createSession(id, {});
    const cookie = ctx.auth.createSessionCookie(session.id).serialize();

    await ctx.db.insert("users", {
      id,

      email: args.email,
      password_hash: hashedPassword,
    });
    return { cookie };
  },
});
