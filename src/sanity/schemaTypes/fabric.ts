import { defineField, defineType } from "sanity";

export const fabric = defineType({
  name: "fabric",
  title: "Fabric",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Fabric/Material Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(30),
    }),
  ],
});