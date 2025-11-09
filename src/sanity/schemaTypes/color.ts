// ./schemas/color.ts
import { defineField, defineType } from "sanity";

export const color = defineType({
  name: "color",
  title: "Color",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Color Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "code",
      title: "Color Code",
      type: "string",
      description: "Hex code or CSS color (e.g. #FF0000, rgb(255,0,0))",
      validation: (Rule) =>
        Rule.required().regex(/^#([0-9A-Fa-f]{6})$/, {
          name: "hex color",
          invert: false,
        }),
    }),
  ],
});