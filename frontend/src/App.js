import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Redirect to the static site (Al-Fawzan)
    window.location.replace("/site/index.html");
  }, []);
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <p>Loading مركز الفوزان...</p>
    </div>
  );
}

export default App;
