import * as z from 'zod';

import { kubernetesNameSchema } from '@/lib/utils/kubernetes-validation';

import {
  addLabelDraftIssue,
  descriptionSchema,
  labelSchema,
} from '../fields/label-validation';

export { LABEL_MAX_LENGTH, labelSchema, validateLabelDraft } from '../fields/label-validation';

export const SecretFormMode = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;

export type SecretFormMode = (typeof SecretFormMode)[keyof typeof SecretFormMode];

export function createSecretFormSchema(mode: SecretFormMode) {
  return z
    .object({
      name: kubernetesNameSchema,
      password: z.string(),
      description: descriptionSchema,
      alias: z.string().refine(
        value => value === '' || kubernetesNameSchema.safeParse(value).success,
        { message: 'Alias can only contain lowercase letters, numbers, hyphens, and dots' },
      ),
      labels: z.array(labelSchema),
      labelDraft: z.string(),
    })
    .superRefine((data, ctx) => {
      if (mode === SecretFormMode.CREATE && data.password.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Value is required',
          path: ['password'],
        });
      }

      addLabelDraftIssue(ctx, data);
    });
}

export type SecretFormValues = z.infer<ReturnType<typeof createSecretFormSchema>>;

export interface SecretFormProps {
  mode: SecretFormMode;
  secretName?: string;
  onSuccess?: () => void;
}
