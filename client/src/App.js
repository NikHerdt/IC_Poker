import React, { useContext, useEffect } from 'react';
import Axios from 'axios';
import MainLayout from './layouts/_MainLayout';
import LoadingScreen from './components/loading/LoadingScreen';
import globalContext from './context/global/globalContext';
import Routes from './components/routing/Routes';
import contentContext from './context/content/contentContext';
import Text from './components/typography/Text';
import modalContext from './context/modal/modalContext';
import config from './clientConfig';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';

const App = () => {
  const { isLoading, setIsLoading } = useContext(globalContext);
  const { isLoading: contentIsLoading } = useContext(contentContext);

  return (
    <>
      {isLoading || contentIsLoading ? (
        <LoadingScreen />
      ) : (
        <MainLayout>
          <Routes />
        </MainLayout>
      )}
      {config.isProduction && <GoogleAnalytics />}
    </>
  );
};

export default App;
