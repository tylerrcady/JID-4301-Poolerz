interface Props {
    text: string;
    type?: "primary" | "secondary" | "logout";
    onClick?: () => any;
    submit?: boolean;
    icon?: React.ReactNode;
    disabled?: boolean;
    width?: string | number;
    children?: React.ReactNode;
  }
  
  export default function Button({
    text,
    type = "primary",
    onClick,
    width,
    disabled = false,
    submit = false,
    icon = undefined,
    children,
  }: Props) {
    let styles = "";
  
    if (disabled) {
      styles =
        "text-base font-opensans text-icon-blue px-4 pt-2";
    } else {
      styles = `text-blue pt-2 pb-[0.5625rem] text-base font-opensans rounded gap-2 hover:text-lightblue active:text-blue`;
      if (type === "primary") {
        styles += " border";
      } else if (type === "logout") {
        styles = `text-red pt-2 pb-[0.5625rem] text-base font-opensans rounded gap-2 hover:text-darkred active:text-red`;
      }
    }
  
    return (
      <button
        onClick={onClick}
        className={`flex w-full items-start justify-start font-semibold ${styles}`}
        disabled={disabled}
        type={submit ? "submit" : "button"}
        style={{ width }}
        title={text}
      >
        <span className="line-clamp-1">{children || text}</span>
        {icon ? <span>{icon}</span> : null}
      </button>
    );
  }