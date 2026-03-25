import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import "@fontsource/cairo/400.css";
import "@fontsource/cairo/500.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import "cropperjs/dist/cropper.css";

import "./i18n";
import "./index.css";

import App from "./App";
import { AppToaster } from "./components/app/app-toaster";
import { TaxSettingsSync } from "./components/common/TaxSettingsSync";
import { AppPreferencesProvider } from "./providers/app-preferences-provider";
import { persistor, store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppPreferencesProvider>
          <TaxSettingsSync />
          <App />
          <AppToaster />
        </AppPreferencesProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
