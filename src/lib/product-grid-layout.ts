/** Avoid a lone item on the last row when 4 cards sit in a 3-column tablet grid. */
export function productGridSectionProps(itemCount: number): {
  className: string;
  "data-item-count": number;
} {
  return {
    className: "product-grid product-grid--balanced",
    "data-item-count": itemCount,
  };
}
