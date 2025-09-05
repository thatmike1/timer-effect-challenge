import { type PluginDefinition, createSchemaBuilder } from "@alfons-app/pdk";
import { TimerRegular } from "@fluentui/react-icons";
import { name } from "./package.json";
import type { z } from "zod";

const $ = createSchemaBuilder(name);

const Definition = {
  Icon: () => <TimerRegular />,
  schema: $.object({
    interval: $.number()
      .min(1)
      .max(300000) // Max 5 minutes (300,000ms)
      .default(1000),

    action: $.reference().setupInspector({
      shouldAllowLink: () => (node) =>
        /^@[^/]+\/actions-[^/]+$/.test(node.type),
      sourcing: "reference",
    }),

    repeat: $.boolean().default(false),

    unit: $.enum(["ms", "s"]).default("ms"),
  }),
  shouldAllowChild: () => () => false,
} satisfies PluginDefinition;

export default Definition;

export type Props = z.infer<typeof Definition.schema>;
