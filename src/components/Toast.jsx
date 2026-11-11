export default function Toast({ message }) {
  return (
    <div id="toast" style={{ opacity: message ? 1 : 0 }}>{message}</div>
  );
}
