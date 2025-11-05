import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import Welcome from "@/pages/welcome";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Password from "@/pages/password";
import TwoFA from "@/pages/two-fa";
import Home from "@/pages/home";
import PIX from "@/pages/pix";
import StableCOIN from "@/pages/stablecoin";
import Investments from "@/pages/investments";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/password" component={Password} />
      <Route path="/two-fa" component={TwoFA} />
      <Route path="/home" component={Home} />
      <Route path="/pix" component={PIX} />
      <Route path="/stablecoin" component={StableCOIN} />
      <Route path="/investments" component={Investments} />
      <Route path="/settings" component={Settings} />
      <Route path="/support" component={Support} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="inwista-theme">
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
