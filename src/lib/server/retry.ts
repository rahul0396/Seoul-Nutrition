// MongoDB aborts a transaction when two orders touch the same product at the
// same instant ("TransientTransactionError"). The fix MongoDB recommends is to
// simply run it again; nothing from the aborted attempt was saved.
export async function withRetry<T>(fn: () => Promise<T>, tries = 5): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const labels = (e as { errorLabelSet?: Set<string>; errorLabels?: string[] });
      const transient = labels.errorLabelSet?.has("TransientTransactionError") || labels.errorLabels?.includes("TransientTransactionError") || /Write conflict|WriteConflict/i.test(String((e as Error)?.message));
      if (!transient || i >= tries) throw e;
      await new Promise((r) => setTimeout(r, 40 * i + Math.random() * 60));
    }
  }
}
