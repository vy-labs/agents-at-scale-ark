import * as z from 'zod';

export const LABEL_MAX_LENGTH = 57;

export const labelSchema = z
  .string()
  .min(1, { message: 'Label cannot be empty' })
  .max(LABEL_MAX_LENGTH, {
    message: `Label must be ${LABEL_MAX_LENGTH} characters or less`,
  })
  .regex(/^[a-zA-Z0-9]([-_.a-zA-Z0-9]*[a-zA-Z0-9])?$/, {
    message:
      "Use letters, digits, '-', '_' or '.', starting and ending with a letter or digit",
  });

export const validateLabelDraft = (
  draft: string,
  labels: string[],
): string | null => {
  const label = draft.trim();
  if (!label) {
    return null;
  }
  if (labels.includes(label)) {
    return `"${label}" has already been added`;
  }
  const parsed = labelSchema.safeParse(label);
  return parsed.success ? null : parsed.error.issues[0].message;
};

export const descriptionSchema = z
  .string()
  .max(256, { message: 'Description must be 256 characters or less' })
  .optional();

export function addLabelDraftIssue(
  ctx: z.RefinementCtx,
  data: { labelDraft: string; labels: string[] },
): void {
  const message = validateLabelDraft(data.labelDraft, data.labels);
  if (message) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: ['labelDraft'],
    });
  }
}
