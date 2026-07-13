//import { ITag } from "../../types/types";

const Tags = ({ text, tag = "default" }: { text: string; tag?: any }) => {
  return (
    <span
      className={` whitespace-nowrap
    text-xs py-1 px-2 rounded-md w-fit
    ${tag === "primary"
          ? "text-primary bg-primary-v5"
          : tag === "secondary"
            ? "text-secondary-dark bg-secondary-v6"
            : tag === "danger"
              ? "text-danger bg-red-100"
              : tag === "success"
                ? "text-green-700 bg-green-100"
                : tag === "gray"
                  ? "text-gray-700 bg-gray-200"
                  : tag === "ternary"
                    ? "text-ternary-text bg-ternary-bg"
                    : "text-base bg-base-light-v1"
        }
    `}
    >
      {text}
    </span>
  );
};

export default Tags;
