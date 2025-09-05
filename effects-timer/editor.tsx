import { type PluginDefinition, createSchemaBuilder } from '@alfons-app/pdk';
import { name } from './package.json';
import type Zod from 'zod';

const $ = createSchemaBuilder(name);

const Definition = {
Icon: () => '💫',
  schema: $.object({}),
} satisfies PluginDefinition;

export default Definition;

export type Props = Zod.infer<typeof Definition.schema>;
