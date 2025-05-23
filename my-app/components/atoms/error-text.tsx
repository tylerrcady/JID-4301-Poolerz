interface Props {
    error?: string;
}

export default function ErrorText({ error }: Props) {
    return (
        <>
            {error ? (
                <div className="text-sm font-normal text-error-red mt-[0.3125rem]">
                    {error}
                </div>
            ) : null}
        </>
    );
}
