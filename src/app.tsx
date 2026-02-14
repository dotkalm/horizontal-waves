import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { ThemeProvider } from "./theme";

export default function App() {
  return (
    <ThemeProvider>
      <Router
        root={props => (
          <MetaProvider>
            <Title>Horizontal Waves</Title>
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}
