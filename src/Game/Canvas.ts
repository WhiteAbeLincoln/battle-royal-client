
/**
 * Helper function to save and restore the canvas state
 * @param scope Function which gets a canvas context
 */
export const withContext = (scope: (ctx: CanvasRenderingContext2D) => void) =>
                           (ctx: CanvasRenderingContext2D) => {
  // tslint:disable:no-expression-statement
  ctx.save()
  scope(ctx)
  ctx.restore()
}
