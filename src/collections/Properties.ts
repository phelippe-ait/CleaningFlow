import type { Access, CollectionConfig } from "payload"

const managerOnly: Access = ({ req }) =>
  req.user?.collection === "users" && req.user.role === "manager"

export const Properties: CollectionConfig = {
  slug: "properties",
  admin: {
    group: "CleanFlow",
    useAsTitle: "name",
    defaultColumns: ["name", "client", "suburb"],
  },
  access: {
    create: managerOnly,
    read: managerOnly,
    update: managerOnly,
    delete: managerOnly,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "client",
      type: "relationship",
      relationTo: "clients",
      required: true,
    },
    { name: "address", type: "text", required: true },
    { name: "suburb", type: "text", required: true },
    { name: "accessNotes", type: "textarea" },
    { name: "defaultInstructions", type: "textarea" },
  ],
}
