type AuthMessageProps = {
  error?: string;
  message?: string;
};

export function AuthMessage({ error, message }: AuthMessageProps) {
  const text = error ?? message;

  if (!text) {
    return null;
  }

  return (
    <p
      className={`rounded-md border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-route/20 bg-route/10 text-route"
      }`}
    >
      {text}
    </p>
  );
}
