import type { Access, CollectionConfig } from "payload"

const managerOnly: Access = ({ req }) =>
  req.user?.collection === "users" && req.user.role === "manager"

export const Clients: CollectionConfig = {
  slug: "clients",
  admin: {
    group: "CleanFlow",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "phone"],
  },
  access: {
    create: managerOnly,
    read: managerOnly,
    update: managerOnly,
    delete: managerOnly,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email" },
    { name: "phone", type: "text" },
    { name: "notes", type: "textarea" },
  ],
}
