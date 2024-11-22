interface Props {
    text: string;
    type?: "primary" | "secondary" | "cancel";
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
