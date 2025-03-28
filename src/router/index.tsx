import { useState, useEffect } from 'react';
import { createContext, useContext } from 'react';

// Define router context and types
type RouterContextType = {
  currentPath: string;
  navigate: (path: string) => void;
};

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
});

// Custom hook to use router
export const useRouter = () => useContext(RouterContext);

// Router provider component
export const RouterProvider = ({ children, routes }: { children?: (Component: React.ComponentType) => React.ReactNode, routes: Record<string, React.ComponentType> }) => {
  // Initialize with current path or default to '/'
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Use the pathname part of the URL without the leading slash
    return typeof window !== 'undefined' 
      ? window.location.pathname === '/' 
        ? '/' 
        : window.location.pathname
      : '/';
  });

  // Handle navigation
  const navigate = (path: string) => {
    // Update browser history
    window.history.pushState(null, '', path);
    // Update current path state
    setCurrentPath(path);
  };

  // Listen for popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Get the component for the current route
  console.log('currentPath', currentPath);
  
  const RouteComponent = routes[currentPath] || routes['/not-found'] || routes['/'];

  // Provide router context and render current route
  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children ? children(RouteComponent) : <RouteComponent />}
    </RouterContext.Provider>
  );
};

// Route mapping utility
export const createRoutes = (routeComponents: Record<string, React.ComponentType>) => {
  return routeComponents;
};
