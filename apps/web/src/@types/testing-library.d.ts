import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      // Add the toBeInTheDocument matcher
      toBeInTheDocument(): R;
      
      // Add other matchers from @testing-library/jest-dom
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveAttribute(attr: string, value?: any): R;
      toHaveClass(...classNames: string[]): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: { [name: string]: any }): R;
      toHaveStyle(css: string | { [key: string]: any }): R;
      toHaveValue(value?: string | string[] | number): R;
    }
  }
} 