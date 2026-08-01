export default function Num({ children }) {
  if (children === undefined || children === null) return null;
  return (
    <span translate="no" className="notranslate">
      {children}
    </span>
  );
}
