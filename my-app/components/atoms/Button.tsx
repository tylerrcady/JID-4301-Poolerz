interface Props {
    text: string;
    type?: "primary" | "secondary" | "cancel" | "login" | "signup";
    onClick?: () => void;
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
        styles = "text-base font-opensans text-blue px-4 pt-2";
    } else {
        styles = `text-blue pt-2 text-base font-opensans rounded gap-2 hover:text-lightblue active:text-blue`;
        if (type === "primary") {
            styles = `text-black pt-2 text-base font-opensans rounded gap-2 hover:text-darkred active:text-black`;
            styles += " border";
        }
        if (type === "cancel") {
            styles = `text-black pt-2 text-base font-opensans rounded gap-2 hover:text-darkred active:text-black`;
        }
        if (type === "login") {
            styles = `text-white bg-blue pt-2 px-4 py-2 text-base font-opensans rounded gap-2 hover:bg-lightblue active:text-black`;
        }
        if (type === "signup") {
            styles = `text-gray bg-white pt-2 px-4 py-2 text-base font-opensans rounded gap-2 hover:bg-lightblue active:text-black`;
        }
    }

    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center justify-center font-semibold ${styles}`}
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
