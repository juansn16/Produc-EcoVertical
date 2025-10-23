import { BrowserRouter as Router } from "react-router-dom";
import { useEffect, useState } from "react";
import AppRoutes from "./routers/AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { EventProvider } from "./contexts/EventContext";
import ApiStatusChecker from "./components/common/ApiStatusChecker";

function App() {
  const [Toaster, setToaster] = useState(null);

  useEffect(() => {
    // Importación dinámica de react-hot-toast
    import('react-hot-toast').then(({ Toaster: ToasterComponent }) => {
      setToaster(() => ToasterComponent);
    }).catch((error) => {
      console.warn('react-hot-toast no disponible:', error);
    });
  }, []);

  return (
    <AuthProvider>
      <EventProvider>
        <ApiStatusChecker>
          <Router>
            <div>
              <AppRoutes />
              {Toaster && (
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              )}
            </div>
          </Router>
        </ApiStatusChecker>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;