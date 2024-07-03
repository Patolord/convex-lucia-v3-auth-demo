import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
import { v } from "convex/values";

// maybe have a profile table for public information
const users = defineEnt({
  id: v.string(),

  email: v.string(),

  password_hash: v.string(),
})
  .index("byId", ["id"])

  .index("byEmail", ["email"]);

const sessions = defineEnt({
  id: v.string(),
  user_id: v.string(),
  expires_at: v.float64(),
})
  .index("byId", ["id"])
  .index("byUserId", ["user_id"]);

const schema = defineEntSchema({
  users,

  sessions,
});

export default schema;
export const entDefinitions = getEntDefinitions(schema);
