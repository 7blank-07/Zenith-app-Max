import '../globals.css';

export default function ToolsLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/tool-style.css" />
      <link rel="stylesheet" href="/assets/css/watchlist-styles.css" />
      {children}
    </>
  );
}
