/**
 * Ledger of Ash design reminder:
 * Keep routing minimal; the prototype is a persistent campaign ledger, not a generic dashboard.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminConsole } from "./pages/AdminConsole";
import Home from "./pages/Home";

function PlayerHome() {
  return <Home />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Switch>
            <Route path="/admin" component={AdminConsole} />
            <Route path="/admin/:section" component={AdminConsole} />
            <Route component={PlayerHome} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
