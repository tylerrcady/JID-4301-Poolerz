interface Props {
    text: string;
    type?: "primary" | "secondary" | "cancel" | "remove" | "login" | "signup";
    onClick?: () => void;
    submit?: boolean;
    icon?: React.ReactNode;
    disabled?: boolean;
    width?: string | number;
    children?: React.ReactNode;
}

export default function Button({
    icon = undefined,
    text,
    type = "primary",
    onClick,
    width,
    disabled = false,
    submit = false,
    children,
}: Props) {
    let styles = "";

    if (disabled) {
        styles = "text-base font-opensans text-blue px-4 pt-2";
    } else {
        styles = `text-blue pt-2 text-base font-opensans rounded gap-2 hover:text-lightblue active:text-blue`;
        if (type === "primary") {
            styles = `text-white bg-blue pt-2 px-4 py-2 text-sm font-opensans rounded gap-2 hover:bg-lightblue active:text-black`;
            styles += " border";
        }
        if (type === "cancel") {
            styles = `text-black bg-white px-4 py-2 text-sm font-opensans rounded gap-2 hover:text-red active:text-black`;
            styles += " border";
        }
        if (type === "remove") {
            styles = `text-red bg-white pt-2 py-2 text-sm font-opensans rounded gap-2 hover:text-darkred active:text-black`;
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
            {icon ? <span>{icon}</span> : null}
            <span className="line-clamp-1">{children || text}</span>
        </button>
    );
}
