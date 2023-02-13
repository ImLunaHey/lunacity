/** 
  * This function searches for the every react-aria SSR ids in a given HTMLElement node and replace every attribute values with a static id 
  * 
  * This can be useful when you're trying to generate a snapshot of components using react-aria under the hood 
  * 
  * @ex : 
  * ``` 
  * const { container } = render(<Component />); 
  * 
  * replaceReactAriaIds(container); 
  * ``` 
  * 
  * @param container The HTMLElement node to search for SSR ids 
  * 
  * @source: https://github.com/jpuri/react-draft-wysiwyg/issues/780#issuecomment-1190668723
  */
export const replaceDynamicIds = (container: HTMLElement) => {
  const selectors = ['id', 'for', 'aria-labelledby'];
  const ariaSelector = (el: string) => `[${el}^="react-aria"]`;
  const regexp = /react-aria\d+-\d+/g;
  const staticId = 'static-id';

  /** 
   * keep a map of the replaceIds to keep the matching between input "id" and label "for" attributes 
   */
  const attributesMap: Record<string, string> = {};

  container.querySelectorAll(selectors.map(ariaSelector).join(', ')).forEach((el, index) => {
    selectors.forEach((selector) => {
      const attr = el.getAttribute(selector);

      if (attr?.match(regexp)) {
        const newAttr = `${staticId}-${index}`;

        el.setAttribute(selector, attributesMap[attr] || newAttr);

        attributesMap[attr] = newAttr;
      }
    });
  });

  return container;
};