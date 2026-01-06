interface Props {
  status: "idle" | "connected" | "pregame" | "ingame" | "error";
}

const colors = {
  idle: "bg-dim",
  connected: "bg-success",
  pregame: "bg-warning",
  ingame: "bg-accent-red",
  error: "bg-error",
};

export function StatusIndicator({ status }: Props) {
  return <div className={`w-3 h-3 rounded-full ${colors[status]} transition-colors`} />;
}
