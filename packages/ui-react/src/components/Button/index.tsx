import Logo from "../../assets/react.svg?react";
import "../../index.css";

export default function MyButton() {
  return (
    <div className="sdk:text-red-500">
      Button
      {/* @ts-expect-error - Logo is a valid React component */}
      <Logo width={100} height={100} fill="red" />
    </div>
  );
}
