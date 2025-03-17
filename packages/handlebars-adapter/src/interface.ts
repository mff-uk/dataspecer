export interface HandlebarsAdapter {
  /**
   * Use for async functions that you need to pass as data to the template.
   * @example const data = { asyncFunction: adapter.async(async () => await someAsyncFunction()) };
   */
  async<T>(fn: () => Promise<T>): () => T;

  /**
   * Use for create dynamic partials that you need to pass as data to the template.
   * @example const data = { partial: adapter.partial("{{name}} {{surname}}") };
   */
  partial(template: string): unknown;

  /**
   * Renders the template and returns the result.
   */
  render(template: string, data: object, templates?: Record<string, string>): Promise<string>;
}