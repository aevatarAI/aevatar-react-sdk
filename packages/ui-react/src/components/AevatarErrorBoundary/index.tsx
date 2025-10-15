import type React from "react";
import { Component, type ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("UI Error", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("errorInfo:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="sdk:text-[var(--sdk-color-text-primary)] sdk:text-[15px] sdk:font-semibold sdk:text-center sdk:pt-[20px]">
          An error occurred, please check the console
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
