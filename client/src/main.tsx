import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";

import { store, persistor } from "./store";
import App from "./App";
import { TaxSettingsSync } from "./components/common/TaxSettingsSync";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TaxSettingsSync />
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "Cairo, sans-serif",
            },
          }}
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
